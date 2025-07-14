import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, Globe } from 'lucide-react';
import StatCard from './StatCard';

const StatsSection = ({ statsRef }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <motion.div 
      ref={statsRef} 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
    >
      <motion.div variants={itemVariants}>
        <StatCard 
          value="2 Min" 
          description="AI Survey Creation Time" 
          icon={<Zap className="w-8 h-8" />} 
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <StatCard 
          value="10+" 
          description="Distribution Channels" 
          icon={<Globe className="w-8 h-8" />} 
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <StatCard 
          value="24/7" 
          description="Real-Time Response Collection" 
          icon={<Users className="w-8 h-8" />} 
        />
      </motion.div>
    </motion.div>
  );
};

export default StatsSection; 