import prisma from '../../utils/database/prisma.js';
import ApiError from '../../utils/error/api.error.js';
import asyncHandler from '../../utils/middleware/async.handler.js';
import { 
    stripe, 
    formatAmountForStripe, 
    formatAmountFromStripe,
    handleStripeError 
} from '../../config/stripe.js';
import { sendSubscriptionUpdateEmail } from '../../utils/email/email.utils.js';

/**
 * @desc    Get payment methods
 * @route   GET /api/v1/account/billing/payment-methods
 */
export const getPaymentMethods = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const paymentMethods = await prisma.paymentMethod.findMany({
        where: {
            userId,
            isDeleted: false
        },
        select: {
            id: true,
            type: true,
            brand: true,
            last4: true,
            expiryMonth: true,
            expiryYear: true,
            isDefault: true
        }
    });

    res.json({
        success: true,
        data: paymentMethods
    });
});

/**
 * @desc    Add payment method
 * @route   POST /api/v1/account/billing/payment-methods
 */
export const addPaymentMethod = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { paymentMethodId } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { stripeCustomerId: true }
        });

        // Attach payment method to Stripe customer
        await stripe.paymentMethods.attach(paymentMethodId, {
            customer: user.stripeCustomerId
        });

        // Get payment method details from Stripe
        const stripePaymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

        const paymentMethod = await prisma.$transaction(async (tx) => {
            // Set as default if it's the first payment method
            const existingMethods = await tx.paymentMethod.count({
                where: { userId, isDeleted: false }
            });

            const method = await tx.paymentMethod.create({
                data: {
                    userId,
                    stripePaymentMethodId: paymentMethodId,
                    type: stripePaymentMethod.type,
                    brand: stripePaymentMethod.card.brand,
                    last4: stripePaymentMethod.card.last4,
                    expiryMonth: stripePaymentMethod.card.exp_month,
                    expiryYear: stripePaymentMethod.card.exp_year,
                    isDefault: existingMethods === 0
                }
            });

            await tx.userActivityLog.create({
                data: {
                    userId,
                    activityType: 'PAYMENT_METHOD_ADDED',
                    description: 'Added new payment method',
                    metadata: { paymentMethodId: method.id }
                }
            });

            return method;
        });

        res.status(201).json({
            success: true,
            message: 'Payment method added successfully',
            data: paymentMethod
        });
});

/**
 * @desc    Remove payment method
 * @route   DELETE /api/v1/account/billing/payment-methods/:id
 */
export const removePaymentMethod = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const paymentMethod = await prisma.paymentMethod.findFirst({
        where: {
            id,
            userId,
            isDeleted: false
        }
    });

    if (!paymentMethod) {
        throw new ApiError(404, 'Payment method not found');
    }

    if (paymentMethod.isDefault) {
        throw new ApiError(400, 'Cannot remove default payment method');
    }

    await prisma.$transaction(async (tx) => {
        // Soft delete the payment method
        await tx.paymentMethod.update({
            where: { id },
            data: { isDeleted: true }
        });

        // Detach from Stripe
        await stripe.paymentMethods.detach(paymentMethod.stripePaymentMethodId);

        await tx.userActivityLog.create({
            data: {
                userId,
                activityType: 'PAYMENT_METHOD_REMOVED',
                description: 'Removed payment method',
                metadata: { paymentMethodId: id }
            }
        });
    });

    res.json({
        success: true,
        message: 'Payment method removed successfully'
    });
});

/**
 * @desc    Set default payment method
 * @route   PUT /api/v1/account/billing/payment-methods/:id/default
 */
export const setDefaultPaymentMethod = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const paymentMethod = await prisma.paymentMethod.findFirst({
        where: {
            id,
            userId,
            isDeleted: false
        }
    });

    if (!paymentMethod) {
        throw new ApiError(404, 'Payment method not found');
    }

    await prisma.$transaction(async (tx) => {
        // Remove default status from current default payment method
        await tx.paymentMethod.updateMany({
            where: {
                userId,
                isDefault: true
            },
            data: {
                isDefault: false
            }
        });

        // Set new default payment method
        await tx.paymentMethod.update({
            where: { id },
            data: {
                isDefault: true
            }
        });

        // Update Stripe customer's default payment method
        const user = await tx.user.findUnique({
            where: { id: userId },
            select: { stripeCustomerId: true }
        });

        await stripe.customers.update(user.stripeCustomerId, {
            default_source: paymentMethod.stripePaymentMethodId
        });

        await tx.userActivityLog.create({
            data: {
                userId,
                activityType: 'DEFAULT_PAYMENT_METHOD_UPDATED',
                description: 'Updated default payment method',
                metadata: { paymentMethodId: id }
            }
        });
    });

    res.json({
        success: true,
        message: 'Default payment method updated successfully'
    });
});

export const getSubscriptions = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const subscriptions = await prisma.subscription.findMany({
        where: { userId },
        select: {
            id: true,
            planId: true,
            status: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
            plan: {
                select: {
                    name: true,
                    price: true,
                    interval: true,
                    features: true
                }
            }
        }
    });

    res.json({
        success: true,
        data: subscriptions
    });
});

export const updateSubscription = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id: subscriptionId } = req.params;
    const { planId, paymentMethodId } = req.body;

    const subscription = await prisma.$transaction(async (tx) => {
        // Get current subscription and plan details
        const currentSub = await tx.subscription.findFirst({
            where: { id: subscriptionId, userId },
            include: { plan: true }
        });

        if (!currentSub) {
            throw new ApiError(404, 'Subscription not found');
        }

        // Get new plan details
        const newPlan = await tx.plan.findUnique({
            where: { id: planId }
        });

        if (!newPlan) {
            throw new ApiError(404, 'Plan not found');
        }

        // Update Stripe subscription
        const stripeSubscription = await stripe.subscriptions.update(
            currentSub.stripeSubscriptionId,
            {
                items: [{
                    id: currentSub.stripeSubscriptionItemId,
                    price: newPlan.stripePriceId
                }],
                ...(paymentMethodId && {
                    default_payment_method: paymentMethodId
                })
            }
        );

        // Update local subscription
        const updated = await tx.subscription.update({
            where: { id: subscriptionId },
            data: {
                planId,
                status: stripeSubscription.status,
                currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
                currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
                ...(paymentMethodId && { paymentMethodId })
            },
            include: { plan: true }
        });

        // Log the update
        await tx.userActivityLog.create({
            data: {
                userId,
                activityType: 'SUBSCRIPTION_UPDATED',
                description: 'Subscription plan changed',
                metadata: {
                    oldPlan: currentSub.plan.name,
                    newPlan: newPlan.name,
                    subscriptionId
                }
            }
        });

        // Send notification email
        await sendSubscriptionUpdateEmail(req.user.email, {
            action: 'updated',
            planName: newPlan.name,
            effectiveDate: new Date(),
            nextBillingDate: new Date(stripeSubscription.current_period_end * 1000)
        });

        return updated;
    });

    res.json({
        success: true,
        message: 'Subscription updated successfully',
        data: subscription
    });
});

export const getInvoices = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const [invoices, total] = await Promise.all([
        prisma.payments.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                refunds: true
            }
        }),
        prisma.payments.count({
            where: { userId }
        })
    ]);

    res.json({
        success: true,
        data: {
            invoices,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        }
    });
});

export const getInvoiceDetails = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id: invoiceId } = req.params;

    const invoice = await prisma.invoice.findFirst({
        where: {
            id: invoiceId,
            userId
        },
        include: {
            subscription: {
                include: { plan: true }
            },
            paymentMethod: {
                select: {
                    brand: true,
                    last4: true
                }
            },
            items: true,
            refunds: true
        }
    });

    if (!invoice) {
        throw new ApiError(404, 'Invoice not found');
    }

    // Get Stripe invoice for additional details
    const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoiceId);

    const enrichedInvoice = {
        ...invoice,
        hostedInvoiceUrl: stripeInvoice.hosted_invoice_url,
        invoicePdf: stripeInvoice.invoice_pdf
    };

    res.json({
        success: true,
        data: enrichedInvoice
    });
});

export const downloadInvoice = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id: invoiceId } = req.params;

    const invoice = await prisma.invoice.findFirst({
        where: {
            id: invoiceId,
            userId
        }
    });

    if (!invoice) {
        throw new ApiError(404, 'Invoice not found');
    }

    // Get Stripe invoice PDF URL
    const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoiceId);

    // Log download
    await prisma.userActivityLog.create({
        data: {
            userId,
            activityType: 'INVOICE_DOWNLOADED',
            description: 'Invoice downloaded',
            metadata: { invoiceId }
        }
    });

    // Redirect to Stripe's hosted invoice PDF
    res.redirect(stripeInvoice.invoice_pdf);
});

export const cancelSubscription = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { reason, feedback } = req.body;

    const result = await prisma.$transaction(async (tx) => {
        // Get active subscription
        const subscription = await tx.subscriptions.findFirst({
            where: {
                userId,
                status: 'ACTIVE'
            }
        });

        if (!subscription) {
            throw new ApiError(404, 'No active subscription found');
        }

        // Update subscription status
        const updated = await tx.subscriptions.update({
            where: { id: subscription.id },
            data: {
                status: 'CANCELLED',
                cancelledAt: new Date(),
                cancellationReason: reason,
                cancellationFeedback: feedback
            }
        });

        // Log cancellation
        await tx.userActivityLog.create({
            data: {
                userId,
                activityType: 'SUBSCRIPTION_CANCELLED',
                description: 'Subscription cancelled',
                metadata: { reason, feedback }
            }
        });

        // Send cancellation email
        await sendSubscriptionCancellationEmail(req.user.email, {
            subscriptionId: subscription.id,
            endDate: subscription.currentPeriodEnd
        });

        return updated;
    });

    res.json({
        success: true,
        message: 'Subscription cancelled successfully',
        data: result
    });
});

/**
 * @desc    Get billing overview
 * @route   GET /api/v1/account/billing/overview
 */
export const getBillingOverview = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const overview = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            subscription: {
                select: {
                    id: true,
                    status: true,
                    currentPeriodEnd: true,
                    plan: {
                        select: {
                            name: true,
                            price: true,
                            interval: true
                        }
                    }
                }
            },
            paymentMethods: {
                where: { isDefault: true },
                select: {
                    brand: true,
                    last4: true
                }
            },
            billingAddress: true
        }
    });

    res.json({
        success: true,
        data: overview
    });
});

/**
 * @desc    Get current usage
 * @route   GET /api/v1/account/billing/usage
 */
export const getCurrentUsage = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const usage = await prisma.usage.findMany({
        where: {
            userId,
            timestamp: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
        },
        select: {
            type: true,
            amount: true,
            timestamp: true
        },
        orderBy: {
            timestamp: 'desc'
        }
    });

    res.json({
        success: true,
        data: usage
    });
});

/**
 * @desc    Get billing history
 * @route   GET /api/v1/account/billing/history
 */
export const getBillingHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const [transactions, total] = await Promise.all([
        prisma.billingTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                amount: true,
                currency: true,
                status: true,
                type: true,
                createdAt: true
            }
        }),
        prisma.billingTransaction.count({
            where: { userId }
        })
    ]);

    res.json({
        success: true,
        data: {
            transactions,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        }
    });
});

/**
 * @desc    Get subscription details
 * @route   GET /api/v1/account/billing/subscriptions/:id
 */
export const getSubscriptionDetails = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const subscription = await prisma.subscription.findFirst({
        where: {
            id,
            userId
        },
        select: {
            id: true,
            planId: true,
            status: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
            cancelledAt: true,
            trialEnd: true,
            plan: {
                select: {
                    name: true,
                    description: true,
                    price: true,
                    interval: true,
                    features: true
                }
            },
            paymentMethod: {
                select: {
                    brand: true,
                    last4: true,
                    expiryMonth: true,
                    expiryYear: true
                }
            },
            usage: {
                where: {
                    timestamp: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                },
                select: {
                    type: true,
                    amount: true,
                    timestamp: true
                }
            }
        }
    });

    if (!subscription) {
        throw new ApiError(404, 'Subscription not found');
    }

    res.json({
        success: true,
        data: subscription
    });
});

/**
 * @desc    Create new subscription
 * @route   POST /api/v1/account/billing/subscriptions
 */
export const createSubscription = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { planId, paymentMethodId, couponCode } = req.body;

    const result = await prisma.$transaction(async (tx) => {
        // Get plan details
        const plan = await tx.plan.findUnique({
            where: { id: planId }
        });

        if (!plan) {
            throw new ApiError(404, 'Plan not found');
        }

        // Verify payment method
        const paymentMethod = await tx.paymentMethod.findFirst({
            where: {
                id: paymentMethodId,
                userId,
                isDeleted: false
            }
        });

        if (!paymentMethod) {
            throw new ApiError(404, 'Payment method not found');
        }

        // Create Stripe subscription
        const user = await tx.user.findUnique({
            where: { id: userId },
            select: { stripeCustomerId: true }
        });

        const stripeSubscription = await stripe.subscriptions.create({
            customer: user.stripeCustomerId,
            items: [{ price: plan.stripePriceId }],
            default_payment_method: paymentMethod.stripePaymentMethodId,
            coupon: couponCode,
            expand: ['latest_invoice.payment_intent']
        });

        // Create local subscription record
        const subscription = await tx.subscription.create({
            data: {
                userId,
                planId,
                paymentMethodId,
                stripeSubscriptionId: stripeSubscription.id,
                status: stripeSubscription.status.toUpperCase(),
                currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
                currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
                cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
            }
        });

        // Log activity
        await tx.userActivityLog.create({
            data: {
                userId,
                activityType: 'SUBSCRIPTION_CREATED',
                description: 'Created new subscription',
                metadata: {
                    planId,
                    subscriptionId: subscription.id
                }
            }
        });

        return subscription;
    });

    res.status(201).json({
        success: true,
        message: 'Subscription created successfully',
        data: result
    });
});

/**
 * @desc    Resume cancelled subscription
 * @route   POST /api/v1/account/billing/subscriptions/:id/resume
 */
export const resumeSubscription = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await prisma.$transaction(async (tx) => {
        const subscription = await tx.subscription.findFirst({
            where: {
                id,
                userId,
                status: 'CANCELLED',
                currentPeriodEnd: {
                    gt: new Date()
                }
            }
        });

        if (!subscription) {
            throw new ApiError(404, 'No resumable subscription found');
        }

        // Resume in Stripe
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: false
        });

        // Update local record
        const updated = await tx.subscription.update({
            where: { id },
            data: {
                status: 'ACTIVE',
                cancelAtPeriodEnd: false,
                cancelledAt: null
            }
        });

        // Log activity
        await tx.userActivityLog.create({
            data: {
                userId,
                activityType: 'SUBSCRIPTION_RESUMED',
                description: 'Resumed subscription',
                metadata: { subscriptionId: id }
            }
        });

        return updated;
    });

    res.json({
        success: true,
        message: 'Subscription resumed successfully',
        data: result
    });
}); 