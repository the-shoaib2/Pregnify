import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { InputWithIcon } from "@/components/input-with-icon";
import { FileText, Info } from "lucide-react";

export function AddressForm({ 
  initialData,
  onSubmit,
  copyFromPresent,
  presentAddress
}) {
  const [address, setAddress] = useState(initialData || {
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    nationality: ''
  });

  const handleCopyFromPresent = () => {
    if (presentAddress) {
      setAddress(prev => ({
        ...prev,
        street: presentAddress.street,
        city: presentAddress.city,
        state: presentAddress.state,
        country: presentAddress.country,
        zipCode: presentAddress.zipCode
      }));
    }
  };

  const handleChange = (name, value) => {
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(address);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {copyFromPresent && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-md font-medium">Address</h3>
            <p className="text-sm text-muted-foreground">Enter your address details</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={handleCopyFromPresent}
          >
            <Copy className="mr-2 h-3 w-3" />
            Same as Present Address
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <InputWithIcon
          icon={FileText}
          label="Street"
          value={address.street}
          onChange={(e) => handleChange('street', e.target.value)}
          placeholder="Enter street"
          name="street"
        />
        <InputWithIcon
          icon={FileText}
          label="City"
          value={address.city}
          onChange={(e) => handleChange('city', e.target.value)}
          placeholder="Enter city"
          name="city"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InputWithIcon
          icon={FileText}
          label="State"
          value={address.state}
          onChange={(e) => handleChange('state', e.target.value)}
          placeholder="Enter state"
          name="state"
        />
        <InputWithIcon
          icon={FileText}
          label="Country"
          value={address.country}
          onChange={(e) => handleChange('country', e.target.value)}
          placeholder="Enter country"
          name="country"
        />
        <InputWithIcon
          icon={FileText}
          label="ZIP Code"
          value={address.zipCode}
          onChange={(e) => handleChange('zipCode', e.target.value)}
          placeholder="Enter ZIP code"
          name="zipCode"
        />
      </div>
    </form>
  );
}
