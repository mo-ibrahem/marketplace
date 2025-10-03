"use client"

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, Tag, User, Menu } from "lucide-react";

export default function Navbar() {
  const { user, loading } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSignOut = async () => {
    await auth.signOut();
    // Close the sheet if it's open after signing out
    setIsSheetOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/egbay.svg"
                alt="EgyBay Logo"
                width={120}
                height={40}
              />
            </Link>
          </div>

          {/* Centered Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search for anything..."
                className="block w-full pl-10 pr-3 py-2"
              />
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/products">
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                Browse Products
              </Button>
            </Link>
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/auth?tab=sell">
                      <Button variant="ghost" className="text-gray-700 hover:text-gray-900 flex items-center">
                        <Tag className="h-4 w-4 mr-2" /> Sell
                      </Button>
                    </Link>
                    <Link href="/profile">
                      <Button variant="ghost" className="text-gray-700 hover:text-gray-900 flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="text-xs">
                            {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.user_metadata?.full_name || user.email?.split("@")[0]}</span>
                      </Button>
                    </Link>
                    <Button variant="ghost" onClick={handleSignOut} className="text-gray-700 hover:text-gray-900">
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth?tab=sell">
                      <Button variant="ghost" className="text-gray-700 hover:text-gray-900 flex items-center">
                        <Tag className="h-4 w-4 mr-2" /> Sell
                      </Button>
                    </Link>
                    <Link href="/auth">
                      <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                        <User className="h-4 w-4 mr-2" /> Login
                      </Button>
                    </Link>
                    <Link href="/auth?tab=signup">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">Sign Up</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button (Hamburger) */}
          <div className="md:hidden flex items-center">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="sr-only">
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>
                    Main navigation links for the website.
                  </SheetDescription>
                </div>
                <div className="flex flex-col space-y-4 mt-8">
                  <Link href="/products" onClick={() => setIsSheetOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Browse Products</Button>
                  </Link>
                  <Link href="/auth?tab=sell" onClick={() => setIsSheetOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start"><Tag className="h-4 w-4 mr-2" />Sell</Button>
                  </Link>
                  <hr />
                  {!loading && (
                    <>
                      {user ? (
                        <>
                          <Link href="/profile" onClick={() => setIsSheetOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start">
                              <User className="h-4 w-4 mr-2" /> Profile
                            </Button>
                          </Link>
                          <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-red-500 hover:text-red-600">
                            Sign Out
                          </Button>
                        </>
                      ) : (
                        <>
                          <Link href="/auth" onClick={() => setIsSheetOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start">
                              <User className="h-4 w-4 mr-2" /> Login
                            </Button>
                          </Link>
                          <Link href="/auth?tab=signup" onClick={() => setIsSheetOpen(false)}>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                              Sign Up
                            </Button>
                          </Link>
                        </>
                      )}
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}