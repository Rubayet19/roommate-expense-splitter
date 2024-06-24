import React, { ReactNode } from 'react';

interface FeatureProps {
  title: ReactNode;
  description: ReactNode;
}

const Feature = ({ title, description }: FeatureProps) => {
  return (
    <div className='bg-white p-6 shadow rounded-lg'>
      <h4 className='text-lg font-medium text-gray-800'>{title}</h4>
      <p className='text-base text-gray-600 mt-2'>{description}</p>
    </div>
  );
};

function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-500 py-3 px-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="text-left text-sm" >
          <span>© 2024 Rubayet Bin Mujahid. Open Source under MIT License.</span>
        </div>
        <div className="text-right text-sm">
          <a href="https://github.com/yourusername/yourrepository" className="text-slate-800 text-md font-medium shadow-md p-2 mx-4 bg-slate-100  hover:bg-slate-200 rounded-lg" target="_blank" rel="noopener noreferrer">
              View on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

const HomePage = () => {
  return (
    <div className='flex flex-col min-h-screen'>
      <div className='flex-grow'>
        <div className='bg-gray-50 p-10'>
          <div className='max-w-6xl mx-auto'>
            <h1 className='text-5xl font-extrabold text-center text-gray-800'>
              Roommate Expense Splitter
            </h1>
            <p className='mt-5 text-2xl text-center text-gray-600'>
              Simplify your shared living
            </p>
            <p className='mt-4 text-md text-center text-gray-500'>
              Roommate Expense Splitter is a simple and easy-to-use application that helps you manage your shared living expenses.
            </p>
            <div className='mt-16 text-center'>
              <button className='bg-black hover:bg-slate-700 text-white font-bold py-2 px-4 rounded'>
                Sign up
              </button>
              <button className='ml-5 text-black font-bold py-2 px-4 rounded'>
                Login
              </button>
            </div>
            <h2 className='text-3xl font-semibold text-gray-800 mt-16 mb-6 text-center'>
              Features
            </h2>
            <div className='grid gap-10 md:grid-cols-2 lg:grid-cols-3'>
              <Feature
                title='Track expenses'
                description='Keep track of all your shared expenses, from rent and utilities to groceries and household items.'
              />
              <Feature
                title='Split expenses'
                description='Easily split expenses with your roommates and keep track of who owes what.'
              />
              <Feature
                title='Settle up'
                description='Quickly settle up with your roommates by recording payments and marking expenses as paid.'
              />
              <Feature
                title='Real-time updates'
                description='See everyone’s contributions and balances update in real-time as transactions are made.'
              />
              <Feature
                title='Secure payments'
                description='Use secure payment integration to transfer funds directly between roommates.'
              />
              <Feature
                title='Customizable alerts'
                description='Set custom alerts for due payments to ensure timely contributions from all roommates.'
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};




export default HomePage;


