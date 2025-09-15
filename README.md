
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield, 
  HeartPulse, 
  Smartphone, 
  Bell, 
  Stethoscope, 
  Activity 
} from "lucide-react";

export default function SmartHealthWellness() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900">
      {/* Hero Section */}
      <section className="text-center py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-6">
            <Shield className="w-20 h-20 text-indigo-600 animate-pulse" />
          </div>
          <h1 className="text-5xl font-extrabold mb-4">
            Smart Health & Wellness Monitoring
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-6">
            Empowering individuals with real-time health monitoring, wellness insights, 
            and emergency support.
          </p>
          <Button size="lg" className="rounded-2xl shadow-lg">
            Get Started
          </Button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[
          { icon: <HeartPulse className="w-12 h-12 text-red-500" />, title: "Vital Tracking", desc: "Monitor heart rate, BP, SpO2 in real-time." },
          { icon: <Smartphone className="w-12 h-12 text-green-500" />, title: "Mobile Access", desc: "Track your health anywhere with our app." },
          { icon: <Bell className="w-12 h-12 text-yellow-500" />, title: "Alerts", desc: "Instant SOS alerts to family and doctors." },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
          >
            <Card className="p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <CardContent className="text-center">
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                <p>{feature.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* Wellness Insights */}
      <section className="bg-white py-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-6">
            <Activity className="w-16 h-16 text-indigo-500 animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Wellness Insights</h2>
          <p className="max-w-3xl mx-auto">
            Get AI-powered insights on your health data. Improve lifestyle, 
            manage stress, and boost your overall well-being.
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-600 text-white py-8 text-center">
        <div className="flex justify-center mb-4">
          <Stethoscope className="w-10 h-10 animate-spin" />
        </div>
        <p>&copy; 2025 Smart Health & Wellness. All rights reserved.</p>
      </footer>
    </div>
  );
}
<h1 align="center">💄✨ Rouge Mystique ✨💄</h1>  
<p align="center">
  <em>Unveil Your Mystery – Luxury meets Interactivity</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-HTML5%20CSS3%20JS-orange?style=for-the-badge&logo=html5" />
  <img src="https://img.shields.io/badge/Game-Canvas%20API-red?style=for-the-badge&logo=javascript" />
  <img src="https://img.shields.io/badge/UI-Responsive%20%26%20Animated-ff69b4?style=for-the-badge&logo=css3" />
</p>

---

## 🌟 Demo Preview  
<p align="center">
  <img src="https://media.giphy.com/media/l3q2RJBQ6C3G7rYrO/giphy.gif" width="700px" alt="Demo Animation" />
</p>

---

## 🚀 Features  

✅ **Interactive Lipstick Catcher Game** 🎮  
✅ **Virtual Lipstick Try-On** 💋  
✅ **Add to Cart + Wishlist System** 🛒  
✅ **Smooth Animations & Particles Background** ✨  
✅ **Luxury Product Showcase with Color Swatches** 🎨  
✅ **Mobile-Friendly & Responsive Design** 📱  

---

## 🎮 Game Highlights  

- 🎯 Catch 💄 = **+10 points**  
- 💔 Miss / Wrong product = **Lose a Life**  
- ⚡ Levels increase speed & difficulty  
- ⬅️ ➡️ Use **Arrow keys** or **A D** to move  

<p align="center">
  <img src="https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif" width="400px" alt="Lipstick Catcher Demo" />
</p>

---

## 🖼️ Website Sections  

| ✨ Hero Section | 🎮 Lipstick Catcher | 💎 Products Showcase |
|----------------|--------------------|----------------------|
| ![Hero](https://via.placeholder.com/300x200/ff6b9d/ffffff?text=Hero) | ![Game](https://via.placeholder.com/300x200/ffd93d/000000?text=Game) | ![Products](https://via.placeholder.com/300x200/8b2635/ffffff?text=Products) |

---

## ⚙️ Tech Stack  

- **Frontend:** HTML5, CSS3, JavaScript  
- **Game Engine:** Canvas API  
- **UI:** Animations, transitions, particles ✨  
- **Responsive Layout:** Flexbox + CSS Grid  

---

## 📂 Folder Structure  

