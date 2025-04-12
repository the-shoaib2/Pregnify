import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AuthService } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FindUserFormSkeleton, UserListSkeleton } from "./skeletons";

const formSchema = z.object({
  searchTerm: z.string().min(1, "Please enter a search term"),
});

export function FindUserForm({ onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [foundUsers, setFoundUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchTerm: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsSearching(true);
      const response = await AuthService.findUserForReset(data);
      
      if (response.data.data.multipleUsers) {
        setFoundUsers(response.data.data.users);
      } else if (response.data.data.found) {
        setFoundUsers([response.data.data]);
      }
    } catch (error) {
      form.setError("searchTerm", {
        message: error.message || "Something went wrong",
      });
      setFoundUsers([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = (userId) => {
    const user = foundUsers.find(u => u.userId === userId);
    if (!user.recoveryMethods?.email) {
      toast.error("No recovery methods available for this account. Please contact support.");
      return;
    }
    setSelectedUser(user);
  };

  const handleContinue = () => {
    if (!selectedUser || !selectedUser.recoveryMethods?.email) {
      toast.error("No recovery methods available for this account. Please contact support.");
      return;
    }
    onSuccess(selectedUser);
  };

  if (isSearching && !foundUsers.length) {
    return <FindUserFormSkeleton />;
  }

  if (isSearching && foundUsers.length) {
    return <UserListSkeleton />;
  }

  return (
    <div className="space-y-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="searchTerm"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm">Find your account</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Email, phone, username or name"
                      className="pl-8"
                      {...field}
                    />
                  </div>
                </FormControl>
                <p className="text-[11px] text-muted-foreground">
                  Enter your email address, phone number, username, or full name
                </p>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full h-9" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              "Find Account"
            )}
          </Button>
        </form>
      </Form>

      {foundUsers.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-medium flex justify-between items-center">
            <span>
              {foundUsers.length === 1 ? "Found account" : `Found ${foundUsers.length} accounts`}
            </span>
            {foundUsers.length > 2 && (
              <span className="text-[11px] text-muted-foreground">
                Scroll to see more
              </span>
            )}
          </div>
          <RadioGroup
            value={selectedUser?.userId}
            onValueChange={handleUserSelect}
            className={`space-y-2 ${foundUsers.length > 2 ? 'max-h-[216px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-rounded-lg scrollbar-track-transparent scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800 dark:hover:scrollbar-thumb-slate-700' : ''}`}
          >
            {foundUsers.map((user) => (
              <label
                key={user.userId}
                className={`flex items-center space-x-3 rounded-lg border p-2.5 cursor-pointer hover:bg-accent/50 transition-colors
                  ${selectedUser?.userId === user.userId ? 'border-primary bg-accent/20' : ''}
                  ${!user.recoveryMethods?.email ? 'opacity-60' : ''}
                  ${foundUsers.length > 2 ? 'mr-1' : ''}`}
              >
                <RadioGroupItem 
                  value={user.userId} 
                  id={user.userId}
                  className="h-3.5 w-3.5"
                />
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">{user.name}</p>
                    {user.maskedEmail && (
                      <p className="text-[11px] text-muted-foreground truncate">
                        {user.maskedEmail}
                      </p>
                    )}
                    {!user.recoveryMethods?.email && (
                      <p className="text-[11px] text-red-500">
                        No recovery methods available
                      </p>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </RadioGroup>

          <Button
            className="w-full h-9"
            disabled={!selectedUser || !selectedUser.recoveryMethods?.email}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      )}

      {foundUsers.length === 0 && form.formState.isSubmitSuccessful && (
        <div className="text-center space-y-1 py-2">
          <p className="text-sm text-muted-foreground">No accounts found</p>
          <p className="text-[11px] text-muted-foreground">
            Try searching with a different email, phone, username, or name
          </p>
        </div>
      )}
    </div>
  );
} 