module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B00',        
          hover: '#FF8533',  
          light: 'rgba(255, 107, 0, 0.15)',
        },
        semantic: {
          success: '#00E676',         
          whatsapp: '#25D366',     
          danger: '#FF3B30',          
          warning: '#FFD700', 
        },
        base: {
          background: '#070707',      
          pure: '#000000', 
          surface: '#121212',         
          surfaceLight: '#1A1A1A',   
          border: '#222222',        
          borderLight: '#333333', 
        },
        text: {
          DEFAULT: '#FFFFFF',           
          body: '#E0E0E0',       
          secondary: '#888888',   
          muted: '#555555', 
        }
      },
      fontFamily: {
        title: ['BebasNeue_400Regular', 'sans-serif'], 
        body: ['DMSans_400Regular', 'sans-serif'],     
      }
    },
  },
  plugins: [],
}