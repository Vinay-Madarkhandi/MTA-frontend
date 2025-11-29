"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Receipt } from "lucide-react";

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "19",
      period: "month",
      description: "For small businesses and startups",
      features: [
        "3M AI Credits",
        "20 Hours of platform credits",
        "10 Projects",
        "Access to all Pro Component Blocks",
        "Access to all Pro Templates",
      ],
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
      highlighted: false,
    },
    {
      id: "premium",
      name: "Premium",
      price: "49",
      period: "month",
      description: "For growing businesses",
      features: [
        "8M AI Credits",
        "50 Hours of Platform Credits",
        "20 Projects",
        "Access to all Pro Component Blocks",
        "Access to all Pro Templates",
      ],
      buttonText: "Get Started",
      buttonVariant: "default" as const,
      highlighted: true,
    },
    {
      id: "business",
      name: "Business",
      price: "99",
      period: "month",
      description: "For established businesses",
      features: [
        "20M AI Credits",
        "75 Hours of Platform Credits",
        "Unlimited Projects",
        "Access to all Pro Component Blocks",
        "Access to all Pro Templates",
      ],
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
      highlighted: false,
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-black py-12 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Choose your Pricing Plan
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Get started with our flexible pricing plans designed to scale with
              your business needs.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative bg-zinc-900 border-2 transition-all duration-300 hover:border-blue-500/50 flex flex-col ${
                  plan.highlighted
                    ? "border-blue-500 shadow-lg shadow-blue-500/20"
                    : "border-zinc-800"
                }`}
              >
                <CardContent className="p-5 flex flex-col flex-1">
                  {/* Plan Header */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-white">
                        ${plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-gray-400 text-base ml-2">
                          Per {plan.period}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="flex-1 mb-5">
                    <ul className="space-y-2.5">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2.5">
                          <div className="shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 text-blue-400" />
                          </div>
                          <span className="text-xs text-gray-300 leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <Button
                    variant={plan.buttonVariant}
                    className={`w-full h-12 rounded-lg text-sm font-medium transition-all duration-200 ${
                      plan.highlighted
                        ? "bg-white text-black hover:bg-gray-100 shadow-lg hover:shadow-xl"
                        : "bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enterprise/Organizations Section */}
          <div className="border-2 border-zinc-800 rounded-2xl p-8 md:p-12 bg-zinc-900/50">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Plan for organizations
                </h2>
                <p className="text-gray-400 mb-6">
                  Need custom solutions, dedicated support, or volume pricing?
                  Let's discuss a plan tailored specifically for your
                  organization.
                </p>
                <Button
                  className="bg-white text-black hover:bg-gray-100 font-medium px-6 h-11 rounded-lg"
                  onClick={() => setSelectedPlan("enterprise")}
                >
                  Contact Sales
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                    <span className="text-sm text-gray-300">
                      Unlimited projects
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                    <span className="text-sm text-gray-300">Team support</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                    <span className="text-sm text-gray-300">
                      Custom invoicing
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                    <span className="text-sm text-gray-300">
                      No capping on tokens
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                    <span className="text-sm text-gray-300">
                      Invite members
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                    <span className="text-sm text-gray-300">
                      Standard security features
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                    <span className="text-sm text-gray-300">
                      No capping on sandbox usage
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                    <span className="text-sm text-gray-300">
                      Custom user roles
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
