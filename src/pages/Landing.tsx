import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Users,
  Zap,
  Shield,
  BarChart3,
  Globe,
  ArrowRight,
} from "lucide-react";
import PricingPlans from "@/components/PricingPlans";
import Navbar from "@/components/layouts/Navbar";
import logo from "/Simple invoicing logo.png";

const Landing = () => {
  const features = [
    {
      icon: <img src={logo} alt="Professional Invoices" className="h-8 w-8 object-contain" />,
      title: "Professional Invoices",
      description:
        "Create stunning, professional invoices in minutes with customizable templates.",
      image:
        "https://i.pinimg.com/736x/1c/27/97/1c27978b1672fa20c87c2ba401b1e8ae.jpg",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Client Management",
      description:
        "Keep track of your clients and their information in one organized place.",
      image:
        "https://i.pinimg.com/1200x/b9/d0/eb/b9d0eb41ff9e4a77407e7b25d1a68ffd.jpg",
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Quick Generation",
      description:
        "Generate and send invoices instantly with a streamlined workflow.",
      image:
        "https://i.pinimg.com/736x/37/64/0b/37640b8094add24848c990de27e2b937.jpg",
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Secure & Reliable",
      description:
        "Your data is protected with enterprise-grade security and reliability.",
      image:
        "https://i.pinimg.com/736x/a9/bb/d1/a9bbd1a52ffac8802245292f6d73810c.jpg",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Analytics Dashboard",
      description:
        "Track your business performance with detailed analytics and insights.",
      image:
        "https://i.pinimg.com/736x/32/6d/a6/326da6b951c0a1ccd1fd2ad605dd8e6a.jpg",
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "Multi-Currency Support",
      description:
        "Support for multiple currencies and international business needs.",
      image:
        "https://i.pinimg.com/1200x/79/67/23/7967237e74aecbd3128cebdfa835ab75.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section
        className="relative py-24 lg:py-40 bg-cover bg-center text-center overflow-hidden"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/1200x/69/37/8d/69378df03a6c057de690eb5a55350366.jpg')",
        }}
      >
        {/* Darker overlay for readability */}
        <div className="absolute inset-0 bg-black/60 md:bg-black/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg">
            Create Professional{" "}
            <span className="bg-primary-gradient bg-clip-text text-transparent">
              Invoices
            </span>{" "}
            in Minutes
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Streamline your invoicing process with our powerful and easy-to-use
            platform. Focus on your business, we'll handle the paperwork.
          </p>
          <div className="flex justify-center">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-primary-gradient text-white shadow-lg hover:opacity-95 transition-all duration-300 group"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-foreground">
            Everything You Need to Manage Invoices
          </h2>

          {/* Uniform Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-xl shadow-lg border border-border/70 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-52 object-cover"
                />
                <div className="p-6 text-left">
                  <div className="flex items-center gap-3 mb-3">
                    {feature.icon}
                    <h3 className="text-xl font-semibold text-foreground">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-base">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
            Simple Pricing
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-16 max-w-2xl mx-auto">
            Choose the plan that fits your stage. Start free, upgrade as you
            grow. Transparent pricing, no hidden fees.
          </p>
          <PricingPlans />
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="relative py-24 lg:py-32 bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
        }}
      >
        {/* Darker overlay for contrast */}
        <div className="absolute inset-0 bg-black/70 md:bg-black/60" />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
            Ready to streamline your invoicing?
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-10">
            Join thousands of businesses already using Simple Invoicing. Get
            started today and transform your financial workflow.
          </p>
          <Link to="/signup">
            <Button
              size="lg"
              className="bg-white text-primary shadow-lg hover:bg-gray-100 hover:opacity-95 transition-all duration-300 group"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
