'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from './services/authService';
import { motion } from 'framer-motion';

interface FeatureProps {
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
}

const Feature = ({ icon, title, description }: FeatureProps) => {
  return (
    <motion.div 
      className='bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100'
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="text-indigo-600 mb-4 text-2xl">{icon}</div>
      <h4 className='text-xl font-semibold text-gray-800 mb-2'>{title}</h4>
      <p className='text-base text-gray-600'>{description}</p>
    </motion.div>
  );
};

const TestimonialCard = ({ quote, author }: { quote: string; author: string }) => (
  <motion.div 
    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
  >
    <p className="text-gray-600 italic mb-4">&ldquo;{quote}&rdquo;</p>
    <p className="text-gray-800 font-medium">— {author}</p>
  </motion.div>
);

function Footer() {
  return (
    <footer className="bg-gray-50 py-12 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Roommate Expense Splitter</h3>
            <p className="text-gray-600">Making shared living expenses simple and stress-free.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Links</h3>
            <ul className="space-y-2">
              <li><Link href="/login" className="text-gray-600 hover:text-indigo-600 transition-colors">Login</Link></li>
              <li><Link href="/signup" className="text-gray-600 hover:text-indigo-600 transition-colors">Sign up</Link></li>
              <li><a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Connect</h3>
            <a href="https://github.com/Rubayet19/roommate-expense-splitter" 
              className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition-colors" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub Repository
            </a>
          </div>
        </div>
        <div className="text-center text-sm text-gray-600 mt-12">
          © 2024 Rubayet Bin Mujahid. Open Source under MIT License.
        </div>
      </div>
    </footer>
  );
}

const HomePage = () => {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const user = await getCurrentUser();
      if (user) {
        router.push('/dashboard');
      }
    };

    checkLoginStatus();

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <div className="text-2xl font-bold text-indigo-600">Roommate Expense Splitter</div>
          <div className="space-x-4">
            <Link href="/login">
              <span className="text-gray-600 hover:text-indigo-600 transition-colors">Log in</span>
            </Link>
            <Link href="/signup">
              <span className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Sign Up
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Split Expenses, <span className="text-indigo-600">Not Friendships</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
              The simplest way to track, split, and settle expenses with roommates. No more awkward money talks.
            </p>
            <div className="flex justify-center">
              <Link href="/signup">
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-medium py-3 px-8 rounded-lg shadow-lg shadow-indigo-100"
                >
                  Get Started — It&apos;s Free
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* App Screenshot */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="bg-white rounded-xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              {/* Dashboard screenshot */}
              <img 
                src="/dashboard-screenshot.png" 
                alt="Roommate Expense Splitter Dashboard" 
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Features That Make Shared Living Easier</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our simple tools help roommates manage expenses without the stress.
            </p>
          </motion.div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Feature
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
              </svg>}
              title="Track Expenses"
              description="Keep track of all your shared expenses, from rent and utilities to groceries and household items."
            />
            <Feature
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
              </svg>}
              title="Split Expenses"
              description="Easily split expenses with your roommates and keep track of who owes what with just a few clicks."
            />
            <Feature
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
              </svg>}
              title="Settle Up"
              description="Quickly settle up with your roommates by recording payments and marking expenses as paid."
            />
            <Feature
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>}
              title="Real-time Updates"
              description="See everyone's contributions and balances update in real-time as transactions are made."
            />
            <Feature
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>}
              title="Secure Payments (coming soon)"
              description="Use secure payment integration to transfer funds directly between roommates."
            />
            <Feature
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>}
              title="Customizable Alerts (coming soon)"
              description="Set custom alerts for due payments to ensure timely contributions from all roommates."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes and say goodbye to financial tension with roommates.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 font-bold text-xl">1</div>
              <h3 className="text-xl font-semibold mb-2">Create Your Account</h3>
              <p className="text-gray-600">Sign up in seconds with just your email and password.</p>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 font-bold text-xl">2</div>
              <h3 className="text-xl font-semibold mb-2">Add Your Roommates</h3>
              <p className="text-gray-600">Connect with your roommates to start tracking shared expenses.</p>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 font-bold text-xl">3</div>
              <h3 className="text-xl font-semibold mb-2">Start Tracking Expenses</h3>
              <p className="text-gray-600">Record expenses, split costs, and settle up with ease.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Users Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of happy roommates who use RoomSplit to manage their shared expenses.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="RoomSplit has completely changed how we manage our apartment finances. No more awkward money conversations!"
              author="Alex, Student"
            />
            <TestimonialCard 
              quote="I used to chase my roommates for rent money every month. Now they get automatic reminders and can see what they owe."
              author="Jamie, Professional"
            />
            <TestimonialCard 
              quote="The easiest expense tracking app I've used. The interface is simple and it does exactly what we need."
              author="Taylor, Roommate of 3 years"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-indigo-600 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to simplify your shared expenses?</h2>
            <p className="text-xl mb-10 max-w-3xl mx-auto text-indigo-100">
              Join thousands of roommates who&apos;ve made splitting expenses stress-free.
            </p>
            <Link href="/signup">
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="bg-white text-indigo-600 text-lg font-medium py-3 px-8 rounded-lg shadow-lg"
              >
                Get Started For Free
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="bg-gray-50 py-12 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center">
            <a href="https://github.com/Rubayet19/roommate-expense-splitter" 
              className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition-colors mb-6" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View on GitHub
            </a>
            <div className="text-center text-sm text-gray-600">
              © 2024 Rubayet Bin Mujahid. Open Source under MIT License.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
