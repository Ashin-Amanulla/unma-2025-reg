import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const SponsorshipCards = ({ selectedTier, onSelectTier }) => {
  const [expandedTier, setExpandedTier] = useState(null);

  const tiers = [
    {
      name: "Title Sponsor",
      // price: "₹5,00,000",
      description: "Presented by Partner - Maximum Branding Impact",
      shortDescription: "Exclusive branding rights with maximum visibility",
      benefits: [
        "Prominent logo placement on all event materials, including the stage, banners, delegate kits, and ID cards",
        "Brand visibility on the welcome arch and main stage backdrop",
        "Logo display during live stage sessions and livestreams (where applicable) Keynote speaking opportunity during the main session",
        "Exclusive post-event video interview with a senior brand representative, shared across social media and alumni networks",
        "Dedicated 5-minute brand film screening during the main session",
        "Exclusive branding zone at the venue for immersive brand experience",
        "Special acknowledgment across press releases, social media, and official emailers",
        "Co-branded selfie booth/photo wall for high-visibility social media engagement",
        "Premium exhibition stall at a prime venue location",
        "Logo presence on the event website",
        "One full-page feature/profile in the official event brochure",
      ],
      color: "from-purple-500 to-indigo-600",
      textColor: "text-purple-600",
      borderColor: "border-purple-200",
      maxCount: "Only one",
      highlight: "Most Premium",
    },
    {
      name: "Diamond Sponsor",
      // price: "₹3,00,000",
      description:
        "Powered by - Strategic Partner - High-Impact Brand Visibility",
      shortDescription: "Strategic partnership with high-impact visibility",
      benefits: [
        "Powered by branding on selected event materials and communications",
        "Logo display during live stage sessions and livestreams (where applicable)",
        "Priority stall location in the exhibition zone",
        "Mentions across 3 social media and email campaigns",
        "Brand recognition in press releases and public announcements",
        "Logo inclusion in the welcome screens and slideshow loops at the venue",
        "One exclusive social media reel or alumni spotlight interaction, presented as Powered by [Brand]",
        "Half-page interview or brand story featured in the official event brochure",
        "Speaking opportunity in a prominent panel discussion (3 min)",
      ],
      color: "from-blue-500 to-cyan-600",
      textColor: "text-blue-600",
      borderColor: "border-blue-200",
      maxCount: "One from each sector",
      highlight: "Strategic",
    },
    {
      name: "Gold Sponsor",
      // price: "₹1,50,000",
      description: "Support Sponsor - Strong Mid-Level Brand Positioning",
      shortDescription:
        "Strong mid-level brand positioning with comprehensive benefits",
      benefits: [
        "Logo placement on event banners, official website, and souvenir brochure",
        "On-stage mentions by event anchors during sessions",
        "Brand visibility in alumni WhatsApp/Telegram groups related to the event",
        "QR code or flyer insert included in all participant registration kits",
        "Table banner placement at the event venue",
        "Social media mention (1 campaign)",
        "Post-event thank-you shoutout on official social media channels",
        "Access to networking sessions",
        "Quarter-page advertisement in the official event brochure",
      ],
      color: "from-yellow-500 to-amber-600",
      textColor: "text-yellow-600",
      borderColor: "border-yellow-200",
      maxCount: "No restriction in number",
      highlight: "Popular Choice",
    },
    {
      name: "Silver Sponsor",
      // price: "₹75,000",
      description: "Contributing Sponsor - Standard Visibility & Engagement",
      shortDescription: "Standard visibility with essential benefits",
      benefits: [
        "Logo inclusion on selected event collaterals and materials",
        "Business card-sized ad featured in the souvenir brochure",
        "Brand name display at the venue on a shared Supporters Banner",
        "Logo rotation on digital LED screens at the event venue",
        "Mention in the event's post-program thank-you reel and official photo gallery",
        "Basic social media mention from official event handles",
        "Standard seating for one representative",
        "Direct referrals to 5 business contacts from the alumni circle (curated leads)",
        "1 Complimentary event pass",
      ],
      color: "from-gray-500 to-slate-600",
      textColor: "text-gray-600",
      borderColor: "border-gray-200",
      maxCount: "No restriction in number",
      highlight: "Entry Level",
    },
    {
      name: "Product Stall Sponsor",
      // price: "₹25,000",
      description:
        "Stall-Only Promotional Opportunity - Ideal for Startups, Product Demos & Sales",
      shortDescription: "Perfect for startups and product demonstrations",
      benefits: [
        "Branded stall space at the venue (3x3 meter or 2x2)",
        "Brand name and booth location featured in the official event directory",
        "Logo display on the stall layout map and promotional standees",
        "Opportunity to distribute flyers, samples, or merchandise to attendees",
        "Ideal setup for live product demos, soft launches, and lead generation",
      ],
      color: "from-green-500 to-emerald-600",
      textColor: "text-green-600",
      borderColor: "border-green-200",
      maxCount: "No restriction in number, subject to availability",
      highlight: "Stall Only",
    },
    {
      name: "Billboard Advertisement",
      // price: "Contact Us",
      description: "High-Impact Outdoor Advertising Opportunity",
      shortDescription:
        "Maximum visibility through strategic billboard placement",
      benefits: [
        "Premium billboard placement at high-traffic locations",
        "Strategic positioning for maximum brand exposure",
        "Custom-designed billboard artwork",
        "Extended display duration",
        "Digital or traditional billboard options available",
        "Location-specific targeting",
        "High-resolution brand visibility",
        "24/7 brand presence",
      ],
      color: "from-orange-500 to-red-600",
      textColor: "text-orange-600",
      borderColor: "border-orange-200",
      maxCount: "Limited spots available",
      highlight: "Outdoor",
    },
    {
      name: "Digital Screen Advertisement",
      // price: "Contact Us",
      description: "Dynamic Digital Display Advertising",
      shortDescription: "Engaging digital screen presence at the venue",
      benefits: [
        "Premium placement on venue digital screens",
        "Dynamic content display capabilities",
        "High-visibility locations throughout the venue",
        "Custom-designed digital advertisements",
        "Flexible content scheduling",
        "Real-time content updates",
        "Interactive display options",
        "Analytics and engagement tracking",
      ],
      color: "from-pink-500 to-rose-600",
      textColor: "text-pink-600",
      borderColor: "border-pink-200",
      maxCount: "Limited spots available",
      highlight: "Digital",
    },
  ];

  const toggleTier = (tierName) => {
    setExpandedTier(expandedTier === tierName ? null : tierName);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Main Sponsorship Tiers */}
      <div className="space-y-4">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative rounded-xl overflow-hidden border ${
              tier.borderColor
            } ${
              selectedTier === tier.name
                ? "ring-2 ring-blue-500"
                : "hover:shadow-lg"
            }`}
          >
            {/* Header - Always Visible */}
            <div
              className={`bg-gradient-to-r ${tier.color} p-6 cursor-pointer`}
              onClick={() => toggleTier(tier.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white">
                      {tier.name}
                    </h3>
                  </div>
                  <p className="mt-1 text-white/90 text-sm">
                    {tier.shortDescription}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-white">
                    {tier.price}
                  </span>
                  <ChevronDownIcon
                    className={`w-6 h-6 text-white transition-transform ${
                      expandedTier === tier.name ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Expandable Content */}
            <AnimatePresence>
              {expandedTier === tier.name && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white"
                >
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 text-sm font-medium text-white rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
                        {tier.highlight}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {tier.benefits.map((benefit, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 text-gray-600"
                        >
                          <svg
                            className={`w-5 h-5 ${tier.textColor} flex-shrink-0 mt-0.5`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTier(tier.name);
                      }}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        selectedTier === tier.name
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-50 text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {selectedTier === tier.name
                        ? "Selected"
                        : "Select this tier"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SponsorshipCards;
