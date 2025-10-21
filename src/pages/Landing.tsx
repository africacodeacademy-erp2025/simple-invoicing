import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Users,
  Zap,
  Shield,
  BarChart3,
  Globe,
  ArrowRight,
} from "lucide-react";
import PricingPlans from "@/components/PricingPlans";
import ThemeToggle from "@/components/ui/ThemeToggle";

const Landing = () => {
  const features = [
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Professional Invoices",
      description:
        "Create stunning, professional invoices in minutes with customizable templates.",
      image:
        "https://images.pexels.com/photos/7172633/pexels-photo-7172633.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Client Management",
      description:
        "Keep track of your clients and their information in one organized place.",
      image:
        "https://images.pexels.com/photos/3184423/pexels-photo-3184423.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Quick Generation",
      description:
        "Generate and send invoices instantly with a streamlined workflow.",
      image:
        "https://images.pexels.com/photos/5926382/pexels-photo-5926382.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Secure & Reliable",
      description:
        "Your data is protected with enterprise-grade security and reliability.",
      image:
        "https://images.pexels.com/photos/5380649/pexels-photo-5380649.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Analytics Dashboard",
      description:
        "Track your business performance with detailed analytics and insights.",
      image:
        "https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "Multi-Currency Support",
      description:
        "Support for multiple currencies and international business needs.",
      image:
        "https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-gradient rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Simple Invoicing</span>
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

      {/* Hero Section */}
      <section
        className="relative py-20 lg:py-32 bg-cover bg-center text-center"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
        }}
      >
        {/* Darker overlay for readability */}
        <div className="absolute inset-0 bg-black/70 md:bg-black/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Create Professional{" "}
            <span className="bg-primary-gradient bg-clip-text text-transparent">
              Invoices
            </span>{" "}
            in Minutes
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Streamline your invoicing process with our powerful and easy-to-use
            platform.
          </p>
          <div className="flex justify-center">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-primary-gradient hover:opacity-90 text-lg px-8 py-6"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            Everything You Need to Manage Invoices
          </h2>

          {/* Uniform Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-background rounded-2xl shadow-sm border border-border/50 overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6 text-left">
                  <div className="flex items-center gap-3 mb-3">
                    {feature.icon}
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-foreground/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple Pricing
          </h2>
          <p className="text-xl text-foreground/80 mb-16">
            Choose the plan that fits your stage. Start free, upgrade as you
            grow.
          </p>
          <PricingPlans />
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="relative py-20 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
        }}
      >
        {/* Darker overlay for contrast */}
        <div className="absolute inset-0 bg-black/80 md:bg-black/70" />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to streamline your invoicing?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands of businesses already using Simple Invoicing.
          </p>
          <Link to="/signup">
            <Button
              size="lg"
              className="bg-black text-primary hover:bg-white/90 text-lg px-8 py-6"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/20 py-6">
        <div className="text-center text-foreground/60">
          <p>&copy; 2025 Simple Invoicing. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
