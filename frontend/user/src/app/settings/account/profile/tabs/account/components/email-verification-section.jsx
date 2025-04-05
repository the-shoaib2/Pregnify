import React, { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle2, AlertCircle, Loader, Link as LinkIcon, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { InputOTP } from "@/components/ui/input-otp";

const EmailVerificationSection = memo(({ 
  basicInfo,
  verificationDialogOpen,
  setVerificationDialogOpen,
  verificationMethod,
  setVerificationMethod,
  verificationCode,
  setVerificationCode,
  isVerifying,
  verificationSent,
  verificationSuccess,
  successMessage,
  sendVerificationEmail,
  verifyOTPCode
}) => {
  return (
    <div className="rounded-lg border bg-card overflow-hidden transition-all hover:shadow-md">
      <div className="bg-muted/30 px-4 py-2 border-b">
        <h3 className="text-sm font-medium flex items-center">
          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
          Email Address
        </h3>
      </div>
      <div className="p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <p className={`text-sm break-all ${basicInfo?.email ? 'text-foreground font-medium' : 'text-muted-foreground italic'}`}>
              {basicInfo?.email || 'No email set'}
            </p>
            {basicInfo?.isEmailVerified ? (
            <Badge className="flex items-center gap-1 p-1 px-2 text-green-500 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </Badge>
            ) : basicInfo?.email ? (
            <Badge className="flex items-center gap-1 p-1 px-2 text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
              <AlertCircle className="h-3 w-3" />
              Unverified
            </Badge>
          ) : null}
          </div>

          {basicInfo?.email && !basicInfo?.isEmailVerified && (
            <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  onClick={() => setVerificationDialogOpen(true)}
                  className="w-full h-8 mt-2 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 dark:from-green-950/30 dark:to-green-900/20 dark:hover:from-green-900/30 dark:hover:to-green-800/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Verify Email
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Verify Your Email</DialogTitle>
                  <DialogDescription>
                    {!verificationSuccess ? 
                      "Choose how you'd like to verify your email address" : 
                      "Your email has been verified successfully"}
                  </DialogDescription>
                </DialogHeader>
                
                {verificationSuccess ? (
                  <div className="py-6 flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-center">{successMessage}</h3>
                    <p className="text-muted-foreground text-center">
                      Your email address has been verified and your account is now fully activated.
                    </p>
                    <Button 
                      className="mt-4 w-full sm:w-auto"
                      onClick={() => setVerificationDialogOpen(false)}
                    >
                      Continue
                    </Button>
                  </div>
                ) : (
                  <>
                    <Tabs defaultValue="link" onValueChange={setVerificationMethod} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="link" className="flex items-center gap-2">
                          <LinkIcon className="h-4 w-4" />
                          <span>Verification Link</span>
                        </TabsTrigger>
                        <TabsTrigger value="code" className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>Verification Code</span>
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="link" className="space-y-4">
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                          <Mail className="h-12 w-12 mx-auto text-primary opacity-80 mb-2" />
                          <h3 className="text-lg font-medium">Email Verification Link</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            We'll send a secure link to <span className="font-medium">{basicInfo.email}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-3">
                            Click the link in the email to verify your account
                          </p>
                        </div>
                        
                        {!verificationSent ? (
                          <Button 
                            onClick={() => sendVerificationEmail('link')}
                            disabled={isVerifying}
                            className="w-full"
                          >
                            {isVerifying ? (
                              <>
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Verification Link
                              </>
                            )}
                          </Button>
                        ) : (
                          <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
                            <CheckCircle2 className="h-5 w-5 mx-auto mb-1" />
                            <p className="text-sm font-medium">Verification link sent!</p>
                            <p className="text-xs mt-1">Check your email inbox and spam folder</p>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="code" className="space-y-4">
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                          <MessageSquare className="h-12 w-12 mx-auto text-primary opacity-80 mb-2" />
                          <h3 className="text-lg font-medium">Email Verification Code</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            We'll send a 6-digit code to <span className="font-medium">{basicInfo.email}</span>
                          </p>
                        </div>
                        
                        {!verificationSent ? (
                          <Button 
                            onClick={() => sendVerificationEmail('code')}
                            disabled={isVerifying}
                            className="w-full"
                          >
                            {isVerifying ? (
                              <>
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Send Verification Code
                              </>
                            )}
                          </Button>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                                Verification code sent!
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                Please enter the 6-digit code sent to your email.
                              </p>
                            </div>
                            
                            <div className="text-center">
                              <InputOTP 
                                value={verificationCode} 
                                onChange={setVerificationCode}
                                maxLength={6}
                              />
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                onClick={verifyOTPCode}
                                disabled={isVerifying || verificationCode.length !== 6}
                                className="flex-1"
                              >
                                {isVerifying ? (
                                  <>
                                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Verify Code
                                  </>
                                )}
                              </Button>
                              
                              <Button 
                                onClick={() => sendVerificationEmail('code')}
                                variant="outline"
                                className="flex-1"
                                disabled={isVerifying}
                              >
                                <Mail className="mr-2 h-4 w-4" />
                                Resend Code
                              </Button>
                            </div>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                    
                    <DialogFooter className="flex items-center justify-between">
                      <DialogClose asChild>
                        <Button variant="outline" className="text-muted-foreground">
                          Cancel
                        </Button>
                      </DialogClose>
                      
                      {verificationSent && verificationMethod === 'link' && (
                        <Button 
                          onClick={() => sendVerificationEmail('link')}
                          variant="outline"
                          className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Resend Link
                        </Button>
                      )}
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
});

EmailVerificationSection.displayName = 'EmailVerificationSection';

export default EmailVerificationSection;
