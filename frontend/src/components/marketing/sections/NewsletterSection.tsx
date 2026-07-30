import React, { useState } from 'react';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <section className="py-24 bg-black text-white border-t border-white/10 flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-xl mx-auto flex flex-col gap-4">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Get the next essay in your inbox
        </h2>
        <p className="text-sm text-zinc-400 font-normal">
          One considered piece a week on marketing, machines and craft. No noise.
        </p>

        {subscribed ? (
          <div className="mt-4 p-4 rounded-full bg-white/10 border border-white/20 text-white text-xs font-mono">
            ✓ You're subscribed! Check your inbox soon.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full sm:w-80 px-5 py-3 rounded-full bg-zinc-900/90 border border-white/10 text-white placeholder:text-zinc-500 text-xs focus:outline-none focus:border-white/40 transition-colors"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all shadow-md"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
