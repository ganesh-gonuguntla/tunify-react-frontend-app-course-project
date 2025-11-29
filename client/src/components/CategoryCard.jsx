import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import '../styles/navbar.css'

export default function CategoryCard({ category }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        to={`/category/${category.slug}`}
        className={`block h-[250px] w-[350px] rounded-[12px] p-[20px] bg-cover bg-center bg-no-repeat relative overflow-hidden transition-transform duration-200 ease-linear opacity-100 category-${category.slug}`}
      >
        <div className="absolute bottom-[5px] left-0 bg-[rgba(0,0,0,0.35)] flex flex-col justify-end p-4 rounded-[12px]">
          <div className="text-[18px] font-bold text-white">{category.name}</div>
          <div className="text-[14px] text-[#e5e5e5] mt-1">Tap to explore</div>
        </div>
      </Link>
    </motion.div>
  )
}
