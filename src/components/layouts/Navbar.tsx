import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import logo from "/Simple invoicing logo.png";

const Navbar = () => {
  return (
    <nav className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="w-28 h-20 flex items-center justify-center">
            <Link to="/">
              <img
                src={logo}
                alt="Simple Invoicing Logo"
                className="object-contain scale-110"
              />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-primary-gradient hover:opacity-90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
