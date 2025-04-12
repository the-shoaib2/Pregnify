import * as React from "react"
import { cn } from "@/lib/utils"

const InputOTP = React.forwardRef(({ value = "", maxLength = 8, onChange = () => {}, className, ...props }, ref) => {
  const [otp, setOtp] = React.useState(Array(maxLength).fill(""))
  const inputRefs = React.useRef([])

  React.useEffect(() => {
    if (value) {
      const newOtp = value.split("").concat(Array(maxLength - value.length).fill(""))
      setOtp(newOtp)
    } else {
      setOtp(Array(maxLength).fill(""))
    }
  }, [value, maxLength])

  const handleFocus = (index) => {
    inputRefs.current[index]?.select()
  }

  const focusNextInput = (index) => {
    if (index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const focusPrevInput = (index) => {
    if (index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault()
      if (otp[index]) {
        const newOtp = [...otp]
        newOtp[index] = ""
        setOtp(newOtp)
        onChange(newOtp.join(""))
      } else {
        focusPrevInput(index)
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      focusPrevInput(index)
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      focusNextInput(index)
    }
  }

  const handleChange = (e, index) => {
    const value = e.target.value
    if (value && !isNaN(value) && value.length <= 1) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)
      onChange(newOtp.join(""))
      focusNextInput(index)
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").slice(0, maxLength)
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split("").concat(Array(maxLength - pastedData.length).fill(""))
      setOtp(newOtp)
      onChange(newOtp.join(""))
      inputRefs.current[Math.min(pastedData.length, maxLength - 1)]?.focus()
    }
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-2",
        "mx-auto max-w-[400px]",
        className
      )}
      {...props}
    >
      {Array.from({ length: maxLength }, (_, i) => (
        <React.Fragment key={i}>
          <div className="relative">
            <input
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={otp[i]}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onFocus={() => handleFocus(i)}
              onPaste={handlePaste}
              className={cn(
                "h-12 w-12 text-center text-xl font-semibold rounded-lg border-2",
                "bg-background transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
                "disabled:cursor-not-allowed disabled:opacity-50",
                otp[i] ? "border-primary/50" : "border-input"
              )}
            />
            <div className={cn(
              "absolute inset-0 -z-10 rounded-lg",
              "bg-primary/5 transition-opacity duration-200",
              otp[i] ? "opacity-100" : "opacity-0"
            )} />
          </div>
          {(i + 1) % 2 === 0 && i !== maxLength - 1 && (
            <div className="w-2 h-2 rounded-full bg-muted-foreground/25" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
})
InputOTP.displayName = "InputOTP"

export { InputOTP }
