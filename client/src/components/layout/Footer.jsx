import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t py-6">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
        <p>&copy; {currentYear} FormBuilder Pro. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;