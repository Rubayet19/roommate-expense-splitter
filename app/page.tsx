import React, { ComponentProps, ReactNode } from 'react'
import styles from "./page.module.css";

interface FeatureProps extends Omit<ComponentProps<"div">, "title"> {
  description: ReactNode;
  title: ReactNode;
}

interface FeatureProps {
  title: string;
  description:  ReactNode;
}

function Feature({ title, description, ...props }: FeatureProps) {
  return (
    <div className={(styles.featuresFeature)} {...props}>
      <h4 className={styles.featuresFeatureTitle}>{title}</h4>
      <p className={styles.featuresFeatureDescription}>{description}</p>
    </div>
  );
}

export default function HomePage (){
  return (
    <div className='pl-64 pt-5 text-xl font-medium text-gray-600 '>
      <h1>Roommate Expense Splitter</h1>
      <div className='mt-20 text-5xl text-black font-extrabold '>
        <h1>
          Simplify your shared living
        </h1>
        <p className='text-lg text-gray-600 mt-4'>
          Roommate Expense Splitter is a simple and easy-to-use <br />
           application that helps you manage your shared living expenses.
        </p>
      </div>
      <button className='bg-black hover:bg-slate-700 text-white py-2 px-4 rounded mt-10'>
        Sign in
      </button>
      <h2 className='text-3xl font-medium text-gray-800 mt-10'>Features</h2>
      <div className='mt-5 grid gap-[var(--space-10)] grid-cols-[repeat(auto-fit,_minmax(240px,_1fr))]'>
        <Feature
          title='Track expenses'
          description={
            <span>
              Keep track of all your shared expenses, from rent and utilities to groceries and household items.
            </span>
          }
        />
        <Feature
          title='Split expenses'
          description={
            <span>
              Easily split expenses with your roommates and keep track of who owes what.
            </span>
          
          }
        />
        <Feature
          title='Settle up'
          description={
            <span>
              Quickly settle up with your roommates by recording payments and marking expenses as paid.
            </span>
          }
        />
      </div>
    </div>
  )
}


