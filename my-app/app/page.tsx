"use client"
import { motion } from 'framer-motion'
import Link from 'next/link'

const Navbar = () => (
  <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold">nab</Link>
      <div className="flex gap-6 items-center">
        <Link href="/signup" className="px-4 py-2 border border-black rounded-lg hover:bg-gray-800">
          Sign up
        </Link>
      </div>
    </div>
  </nav>
)

const Testimonial = ({ quote, name, school }: {
  quote: string;
  name: string;
  school: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="p-6 bg-white rounded-lg shadow-sm"
  >
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00693E] to-[#00693E]/30 flex items-center justify-center text-white font-bold">
        {name.charAt(0)}
      </div>
      <div>
        <div className="font-bold">{name}</div>
        <div className="text-gray-500 text-sm">{school}</div>
      </div>
    </div>
    <p className="text-gray-600">&quot;{quote}&quot;</p>
  </motion.div>
)

const Testimonials = () => (
  <section className="container mx-auto px-4 py-32 bg-[#fafafa]">
    <h2 className="text-3xl md:text-4xl font-bold text-center mb-24 tracking-tight">
      what students say
    </h2>
    <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
      {[
        {
          quote: "Found my dream iPad for half the retail price. The seller was super nice!",
          name: "Sarah Chen",
          school: "NYU '24",
          imageId: 1
        },
        {
          quote: "Sold all my textbooks in under an hour. This is a game changer!",
          name: "Mike Johnson",
          school: "Harvard '23",
          imageId: 2
        },
        {
          quote: "The AI pricing helped me price my items perfectly. Sold everything!",
          name: "Alex Rivera",
          school: "Caltech '25",
          imageId: 3
        }
      ].map((testimonial, index) => (
        <Testimonial key={index} {...testimonial} />
      ))}
    </div>
  </section>
)

const Steps = () => (
  <section className="container mx-auto px-36 my-20 py-20 bg-[#ffffff] border border-gray-100 rounded-lg">
    <h2 className="text-3xl md:text-4xl font-bold text-center mb-24 tracking-tight">how it works</h2>
    <div className="max-w-3xl mx-auto space-y-6">
      {[
        {
          number: "01",
          title: "sign up",
          desc: "Create your account with your .edu email",
        },
        {
          number: "02",
          title: "list or browse",
          desc: "Post items or browse what's available",
        },
        {
          number: "03",
          title: "connect",
          desc: "Chat with sellers/buyers on campus",
        },
        {
          number: "04",
          title: "nab it",
          desc: "Meet up and complete the transaction",
        }
      ].map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4 items-start group"
        >
          <div className="flex-shrink-0 w-24 pt-2">
            <div className="text-sm font-mono text-[#00693E] font-bold">{step.number}</div>
          </div>
          <div className="flex-grow">

            <h3 className="text-xl font-bold">{step.title}</h3>
            <p className="text-gray-600 text-lg mb-2">{step.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
)

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-36 pb-36">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
                    <div className="inline-block px-4 py-2 bg-[#00693E]/5 rounded-full text-lg mb-8 text-[#00693E]">
            🎉 now live at nyu, harvard, and caltech
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-black tracking-tight">
            get that bag <br></br> (and the couch, and the toaster too)          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto ">
         you drop it, we price it, you profit
         {/* no fees, no hassle, just deals! */}
           {/* no fees, no hassle, just deals */}
          </p>
          
          <Link href="/signup" className="group">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-black text-white rounded-lg tracking-wide
                         transition-all duration-300 mb-4"
          >
              start nabbing
            </motion.button>
          </Link>


        </motion.div>

        <img src="./couch.png" alt="hero" className="w-[55%] h-auto m-auto" />

      </section>

      {/* How it Works Section */}
      <section className="py-8">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto">
            <Steps />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-24 tracking-tight">
            why students love nab
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-6xl mx-auto">
            {[
              {
                title: "dynamic pricing",
                description: "AI-powered pricing suggestions based on market trends and item condition",
                icon: "📈"
              },
              {
                title: "social wishlist",
                description: "Share and discover items with friends. Get notified when your friends list items",
                icon: "🤝"
              },
              {
                title: "smart alerts",
                description: "Real-time notifications for price drops, flash sales, and new listings",
                icon: "🔔"
              },
              {
                title: "social impact",
                description: "Donate items easily, track your environmental impact, support campus initiatives",
                icon: "🌱"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-lg bg-white"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-black tracking-tight">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      {/* Final CTA Section */}
      <section className="container mx-auto px-4  max-w-5xl my-20 py-24 bg-[#ffffff] border border-gray-100 rounded-lg">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto "
        >
                  <img src="./plant.png" alt="hero" className="w-[25%] h-auto m-auto mb-4" />

          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black tracking-tight">
            get your bag and nab some swag
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            join thousands selling their stuff and nabbing the hottest deals on campus
          </p>
          
          <Link href="/signup" className="group">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-black text-white rounded-lg 
                         transition-all duration-300
                       "
            >
              get early access
            </motion.button>
          </Link>
        </motion.div>
      </section>

      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 text-sm border-t border-[#00693E]/10">
        © 2024 nab. all rights reserved.
      </footer>
    </div>
  )
}
