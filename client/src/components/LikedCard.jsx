import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function LikedCard() {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Link to="/liked" className="block h-[250px] w-[350px] rounded-[12px] p-[20px] bg-cover bg-center bg-no-repeat no-underline relative overflow-hidden transition-transform duration-200 ease-linear opacity-100 bg-[url('/liked2.png')]">
        <div className="absolute bottom-[5px] left-0 bg-[rgba(0,0,0,0.35)] flex flex-col justify-end p-[16px] rounded-[12px]">
          <div className="text-[18px] text-[700] text-white">Liked Songs</div>
          <div className="text-[14px] text-[#e5e5e5] mt-[4px]">View all your liked tracks</div>
        </div>
      </Link>
    </motion.div>
  )
}
