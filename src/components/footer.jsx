import { FaWhatsapp, FaPhoneAlt, FaEnvelope, FaClock, FaFacebookF, FaInstagram, FaYoutube, FaPinterestP } from "react-icons/fa";


export default function Footer() {
  return (
    <footer className="bg-red-600 text-white pt-16 pb-10 px-6 text-sm">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
        {/* Logo & Socials */}
        <div>
      
          <p className="text-white mb-6">
            Cek inodmaret dan alfamrt terdekat di daerahmu hanya di website ini saja
          </p>
          <div className="flex gap-4 text-lg text-white">
            <FaFacebookF className="hover:text-green-400 cursor-pointer" />
            <FaInstagram className="hover:text-green-400 cursor-pointer" />
            <FaPinterestP className="hover:text-green-400 cursor-pointer" />
            <FaYoutube className="hover:text-green-400 cursor-pointer" />
          </div>
        </div>

        {/* Home */}
        <div>
          <h4 className="font-bold text-white mb-4">Home</h4>
          <ul className="space-y-2 text-white">
            <li className="hover:text-white cursor-pointer">Colour</li>
            <li className="hover:text-white cursor-pointer">Products</li>
            <li className="hover:text-white cursor-pointer">Inspiration</li>
            <li className="hover:text-white cursor-pointer">Support</li>
            <li className="hover:text-white cursor-pointer">Professional</li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-bold text-white mb-4">Services</h4>
          <ul className="space-y-2 text-white">
            <li className="hover:text-white cursor-pointer">Find a Painter</li>
            <li className="hover:text-white cursor-pointer">Find a Store</li>
            <li className="hover:text-white cursor-pointer">Dulux Colour Designers</li>
            <li className="hover:text-white cursor-pointer">Help & Advice</li>
          </ul>
        </div>

        {/* About */}
        <div>
          <h4 className="font-bold text-white mb-4">About Us</h4>
          <ul className="space-y-2 text-white">
            <li className="hover:text-white cursor-pointer">Contact Us</li>
            <li className="hover:text-white cursor-pointer">Manage My Account</li>
            <li className="hover:text-white cursor-pointer">News & Media</li>
            <li className="hover:text-white cursor-pointer">Careers</li>
            <li className="hover:text-white cursor-pointer">Colour Accuracy</li>
          </ul>
        </div>
      </div>

      {/* Bottom Links */}
      <div className="max-w-7xl mx-auto mt-10 border-t border-gray-700 pt-6 flex flex-wrap justify-center gap-6 text-white">
        <span className="hover:text-white cursor-pointer">FAQs & Returns</span>
        <span className="hover:text-white cursor-pointer">Careers</span>
        <span className="hover:text-white cursor-pointer">Privacy Policy</span>
        <span className="hover:text-white cursor-pointer">Corporate Info</span>
        <span className="hover:text-white cursor-pointer">Recommended Sites</span>
        <span className="hover:text-white cursor-pointer">News & Media</span>
        <span className="hover:text-white cursor-pointer">Site Terms</span>
      </div>

      {/* Copyright */}
      <div className="text-center mt-6 text-white">
        &copy; {new Date().getFullYear()} Bali 88 Trans. All rights reserved.
      </div>
    </footer>
  );
}