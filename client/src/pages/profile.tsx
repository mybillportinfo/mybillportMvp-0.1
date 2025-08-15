import React, { useState, useEffect } from 'react';
import BottomNavigation from "../components/bottom-navigation";
import { User, Settings, Bell, CreditCard, Shield, HelpCircle, LogOut, Edit, Phone, Mail, ArrowLeft } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import ProfilePictureUpload from '@/components/profile-picture-upload';
// @ts-ignore
import { auth } from "../../../lib/firebaseConfig.js";
// @ts-ignore
import { logoutUser } from "../../../services/auth.js";

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  phoneNumber: z.string().min(10, 'Enter a valid phone number').optional(),
});

export default function Profile() {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileImage, setProfileImage] = useState('');

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      email: '',
      phoneNumber: ''
    }
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      if (user) {
        setUser(user);
        form.setValue('displayName', user.displayName || 'John Doe');
        form.setValue('email', user.email || '');
        form.setValue('phoneNumber', user.phoneNumber || '');
        setProfileImage(user.photoURL || '');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [form]);

  const handleSaveProfile = async (data: any) => {
    try {
      // In a real app, you would update the Firebase user profile here
      // await updateProfile(auth.currentUser, {
      //   displayName: data.displayName,
      //   photoURL: profileImage
      // });
      
      setEditing(false);
      toast({
        title: "Profile Updated!",
        description: "Your profile information has been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleMenuClick = (item: string) => {
    switch (item) {
      case "Personal Information":
        setEditing(true);
        break;
      case "Payment Methods":
        window.location.href = "/payment-methods";
        break;
      case "Notifications":
        window.location.href = "/notifications";
        break;
      case "Security":
        window.location.href = "/security";
        break;
      case "App Settings":
        window.location.href = "/app-settings";
        break;
      case "Help & Support":
        window.location.href = "mailto:mybillportinfo@gmail.com?subject=MyBillPort Support Request&body=Hi MyBillPort Team,%0D%0A%0D%0AI need help with:%0D%0A%0D%0A[Please describe your issue here]%0D%0A%0D%0AThank you!";
        break;
      default:
        alert("Feature coming soon!");
    }
  };

  const menuItems = [
    { icon: User, label: "Personal Information" },
    { icon: CreditCard, label: "Payment Methods" },
    { icon: Bell, label: "Notifications" },
    { icon: Shield, label: "Security" },
    { icon: Settings, label: "App Settings" },
    { icon: HelpCircle, label: "Help & Support" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm p-1">
            <img 
              src="/logo.png" 
              alt="MyBillPort Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <h1 className="text-xl font-bold">MyBillPort</h1>
        </div>
        <h2 className="text-lg font-semibold">Profile</h2>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 pb-20 overflow-y-auto bg-gray-50">
        {/* User Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          {!editing ? (
            <div className="flex items-center space-x-4">
              <div className="relative">
                <ProfilePictureUpload 
                  currentImage={profileImage}
                  onImageUpdate={setProfileImage}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {form.getValues('displayName') || 'John Doe'}
                    </h2>
                    <p className="text-gray-500 flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {form.getValues('email') || 'johndoe@example.com'}
                    </p>
                    {form.getValues('phoneNumber') && (
                      <p className="text-gray-500 flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {form.getValues('phoneNumber')}
                      </p>
                    )}
                    <p className="text-sm text-green-600 font-medium mt-1">Verified Account</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                    data-testid="button-edit-profile"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Edit Profile</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(false)}
                  data-testid="button-cancel-edit"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              </div>
              
              <div className="mb-6">
                <ProfilePictureUpload 
                  currentImage={profileImage}
                  onImageUpdate={setProfileImage}
                />
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSaveProfile)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter your full name"
                            data-testid="input-display-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email"
                            placeholder="Enter your email address"
                            data-testid="input-email-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="tel"
                            placeholder="Enter your phone number"
                            data-testid="input-phone-number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditing(false)}
                      className="flex-1"
                      data-testid="button-cancel-profile"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      data-testid="button-save-profile"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleMenuClick(item.label)}
              className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-medium text-gray-800">{item.label}</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-full mt-6 bg-red-50 text-red-600 rounded-2xl p-4 flex items-center justify-center space-x-2 hover:bg-red-100 transition-colors"
          data-testid="button-logout"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>

        {/* App Version */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          MyBillPort v1.0.0
        </div>
      </div>

      <BottomNavigation />
    </>
  );
}
