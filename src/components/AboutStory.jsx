import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function AboutStory() {
  const [isExpanded, setIsExpanded] = useState(false);

  const faqs = [
    {
      q: 'What makes Coitonic an affordable gym wear brand in India?',
      a: 'Coitonic cuts out unnecessary markups by focusing on direct, performance-first design. You get gym wear with real fabric technology — breathable blends, stretch, moisture-wicking — at a price built for regular training, not occasional wear.'
    },
    {
      q: 'Does Coitonic make gym wear for both men and women?',
      a: 'Yes. Coitonic offers dedicated gym wear for men and gym wear for women, including compression fits, tops, bottoms, and outerwear designed around each training style.'
    },
    {
      q: "What's the difference between activewear and performance gym wear?",
      a: 'Active wear is a broader term covering comfortable, athletic-style clothing for daily life and light activity. Performance gym wear is built specifically for training — with features like compression support, moisture-wicking fabric, and stretch built for lifting, running, or HIIT.'
    },
    {
      q: 'Is Coitonic gym wear suitable for daily use, not just workouts?',
      a: 'Yes. Most of our sports clothing — from T-shirts and joggers to tanks and shorts — is designed to move easily from a gym session into everyday wear, without feeling like training gear.'
    },
    {
      q: 'What fabric technology does Coitonic use in its gym clothing?',
      a: 'Our gym wear uses breathable cotton-polyester blends, stretch fabrics for compression pieces, and moisture-wicking finishes depending on the product, all selected to hold up through repeated training and washing.'
    },
    {
      q: 'How do I choose the right gym wear for my training style?',
      a: 'For heavy lifting, look at our compression fit range for support and stability. For cardio or running, breathable T-shirts, tanks, and shorts work best. For outdoor or winter training, our track jackets and joggers add coverage without weighing you down.'
    }
  ];

  const popularSearches = [
    'Gym Wear for Men',
    'Gym Wear for Women',
    'Compression Fit',
    'Oversized T-Shirts',
    'Tank Tops & Stringers',
    '5" Gym Shorts',
    'Tactical Joggers',
    'Winter Gym Wear',
    'Drop Cut Tops',
    'Athletic Activewear'
  ];

  return (
    <section className="w-full bg-white text-zinc-900 py-14 sm:py-20 px-4 sm:px-8 lg:px-12 border-b border-zinc-200 select-none font-sans">
      <div className="w-full text-left">
        
        {/* Main Header */}
        <div className="space-y-1.5 pb-6 border-b border-zinc-200">
          <span className="text-[11px] font-semibold text-red-600 uppercase tracking-[0.2em] block">
            Brand Story & Training Guide
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-zinc-950 tracking-tight">
            Gym Wear for Men & Women
          </h2>
          <p className="text-xs sm:text-sm font-medium text-zinc-600">
            Coitonic — The Indian Gym Wear Brand Built for Real Training
          </p>
        </div>

        {/* Collapsible Content Area */}
        <div className="relative mt-6">
          <div
            className={`transition-all duration-700 ease-in-out overflow-hidden text-xs sm:text-sm text-zinc-600 leading-relaxed space-y-6 ${
              isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-[200px] opacity-90'
            }`}
          >
            {/* Paragraph 1 */}
            <p>
              Coitonic is an Indian gym wear brand making performance apparel for people who actually train — not just people who want to look like they do. From compression fits to everyday active wear, every piece is designed to move with you through lifting, running, HIIT, or a regular gym session, without cutting corners on comfort or price. We believe good gym wear shouldn't cost a compromise. That's why Coitonic exists: affordable gym wear in India that performs like premium sports clothing, without the premium markup.
            </p>

            {/* Subsection 1 */}
            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-semibold text-zinc-950">
                Shop Smarter with an Affordable Gym Wear Brand from India
              </h3>
              <p>
                Finding the right gym wear shouldn't mean choosing between quality and price. As an Indian gym wear brand, Coitonic is built around that exact problem — sourcing performance fabrics, testing real fits, and pricing them for the everyday athlete, not just the top 1%. Whether you're stepping into the gym for the first time or you've been training for years, our sports clothing is made to keep up.
              </p>
            </div>

            {/* Subsection 2 */}
            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-semibold text-zinc-950">
                Why Choose Coitonic Over Other Gym Clothing Brands
              </h3>
              <p>
                We're not trying to be everything. As a gym clothing brand, Coitonic focuses on one thing: apparel that survives real training. That means: Fabric that's actually tested in the gym, not just on a lookbook — breathable blends, stretch-ready construction, and moisture-wicking finishes across our active wear range. Fits built for movement, from compression to relaxed, so your training style decides the cut, not the other way around. Pricing that respects your budget, because performance gym wear shouldn't be a luxury purchase. A full wardrobe, not just a T-shirt — tops, bottoms, outerwear, and accessories designed to work together.
              </p>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm sm:text-base font-semibold text-zinc-950">
                Explore Our Gym Wear Collection
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="font-semibold text-zinc-900">Gym Wear for Men</h4>
                  <p className="text-xs text-zinc-600">
                    Our gym wear for men collection covers every stage of training — compression shirts and tanks for lifting days, breathable T-shirts and stringers for daily sessions, joggers and shorts for mobility, and track jackets for outdoor and winter training.
                  </p>
                  <Link to="/oversized" className="text-red-600 text-xs font-semibold hover:underline inline-block pt-1">
                    Shop Men's Gym Wear →
                  </Link>
                </div>

                <div className="space-y-1">
                  <h4 className="font-semibold text-zinc-900">Gym Wear for Women</h4>
                  <p className="text-xs text-zinc-600">
                    Our gym wear for women collection is built the same way — for performance first. Compression fits, tops, leggings and joggers, and training essentials designed to support real movement through lifting, running, and everyday activity.
                  </p>
                  <Link to="/compression" className="text-red-600 text-xs font-semibold hover:underline inline-block pt-1">
                    Shop Women's Gym Wear →
                  </Link>
                </div>

                <div className="space-y-1">
                  <h4 className="font-semibold text-zinc-900">Compression Fit</h4>
                  <p className="text-xs text-zinc-600">
                    For athletes who want their gear to work as hard as they do, our compression series delivers a closer fit that supports muscle stability, circulation, and recovery.
                  </p>
                  <Link to="/compression" className="text-red-600 text-xs font-semibold hover:underline inline-block pt-1">
                    Shop Compression Fit →
                  </Link>
                </div>

                <div className="space-y-1">
                  <h4 className="font-semibold text-zinc-900">Accessories</h4>
                  <p className="text-xs text-zinc-600">
                    Complete your kit with our accessories range — gym duffels, caps, grip socks, shakers, and more — built to complement your active wear.
                  </p>
                  <Link to="/lowers" className="text-red-600 text-xs font-semibold hover:underline inline-block pt-1">
                    Shop Accessories →
                  </Link>
                </div>
              </div>
            </div>

            {/* Subsection 3 */}
            <div className="space-y-2 pt-2">
              <h3 className="text-sm sm:text-base font-semibold text-zinc-950">
                Built for More Than Just the Gym
              </h3>
              <p>
                Good active wear should work beyond the workout. Coitonic's sports clothes are designed to transition from your training session to the rest of your day — breathable enough for the gym floor, comfortable enough for the commute home. Whether you call it activewear, sportswear, or just your everyday gym kit, the goal is the same: clothing that keeps up with an active life, not just an hour of it.
              </p>
            </div>

            {/* FAQ Section */}
            <div className="space-y-3 pt-4 border-t border-zinc-200">
              <h3 className="text-sm sm:text-base font-semibold text-zinc-950">
                Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-xs sm:text-sm font-semibold text-zinc-900">
                      {idx + 1}. {faq.q}
                    </p>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Searches */}
            <div className="space-y-2 pt-4 border-t border-zinc-200">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-950">
                Popular Searches
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {popularSearches.join(' | ')}
              </p>
            </div>

          </div>

          {/* Fade Overlay when collapsed */}
          {!isExpanded && (
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Full Rounded Read More / Read Less Button */}
        <div className="mt-6 flex justify-start">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-zinc-100 hover:bg-zinc-950 text-zinc-900 hover:text-white border border-zinc-300 hover:border-zinc-950 text-xs font-medium transition-all duration-300 cursor-pointer shadow-none"
          >
            <span>{isExpanded ? 'Read Less' : 'Read More'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-y-0.5" />
            )}
          </button>
        </div>

      </div>
    </section>
  );
}
