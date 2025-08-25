// AppLaunchHero.jsx - Server Component
import EmailSignupForm from './EmailSignupForm';

export default function AppLaunchHero() {
  return (
    <section 
      id="app-launch" 
      className="relative min-h-[80vh] lg:max-h-[800px] sm:max-h-[180vh] md:max-h-[2500px] flex items-center overflow-hidden" 
      style={{backgroundColor: 'rgb(245, 145, 7)'}}
    >
      {/* Multiple Gradient Circles Background */}
      <div className="absolute inset-0">
        {/* Top left - larger edge circle */}
        <img 
          src="https://app.trickle.so/storage/public/images/usr_1443ba33e0000001/b23e4a6e-1b8c-4a07-a016-93a3ae6a7d98.png"
          alt="Gradient Circle"
          className="absolute -top-20 -left-20 w-80 h-80 opacity-40 animate-pulse transform scale-x-[-1]"
        />
        {/* Top right - larger edge circle */}
        <img 
          src="https://app.trickle.so/storage/public/images/usr_1443ba33e0000001/b23e4a6e-1b8c-4a07-a016-93a3ae6a7d98.png"
          alt="Gradient Circle"
          className="absolute -top-16 -right-16 w-72 h-72 opacity-30"
        />
        {/* Bottom left - larger edge circle */}
        <img 
          src="https://app.trickle.so/storage/public/images/usr_1443ba33e0000001/b23e4a6e-1b8c-4a07-a016-93a3ae6a7d98.png"
          alt="Gradient Circle"
          className="absolute -bottom-24 -left-24 w-96 h-96 opacity-35 transform scale-x-[-1]"
        />
        {/* Bottom right - larger edge circle */}
        <img 
          src="https://app.trickle.so/storage/public/images/usr_1443ba33e0000001/b23e4a6e-1b8c-4a07-a016-93a3ae6a7d98.png"
          alt="Gradient Circle"
          className="absolute -bottom-20 -right-20 w-88 h-88 opacity-25"
        />
        {/* Center background circle */}
        <img 
          src="https://app.trickle.so/storage/public/images/usr_1443ba33e0000001/b23e4a6e-1b8c-4a07-a016-93a3ae6a7d98.png"
          alt="Gradient Circle"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-15"
        />
        {/* Additional mid-positioned circles */}
        <img 
          src="https://app.trickle.so/storage/public/images/usr_1443ba33e0000001/b23e4a6e-1b8c-4a07-a016-93a3ae6a7d98.png"
          alt="Gradient Circle"
          className="absolute top-32 left-1/4 w-48 h-48 opacity-20 transform scale-x-[-1]"
        />
        <img 
          src="https://app.trickle.so/storage/public/images/usr_1443ba33e0000001/b23e4a6e-1b8c-4a07-a016-93a3ae6a7d98.png"
          alt="Gradient Circle"
          className="absolute bottom-40 right-1/4 w-56 h-56 opacity-18"
        />
      </div>
      <div className="relative max-w-6xl mx-auto px-4 py-20 text-white">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Text Content - 1/2 width */}
          <div>
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                <span className="text-sm mr-2">✨</span>
                Coming Soon · Personal Concierge for Working Mums
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Shine in Every <span style={{color: 'white'}}>Role,</span> <span style={{color: '#FFE100'}}>Mum</span>
            </h1>
            
            <p className="text-lg md:text-xl mb-8 text-white leading-relaxed">
              Our intelligent companion learns your rhythm and adapts to your needs. Create daily harmony, pursue career growth, build financial confidence, and embrace wellbeing - all effortlessly.
            </p>
            
            {/* Email Signup Form - Client Component */}
            <EmailSignupForm />
            
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-white/80">AI Support</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">1000</div>
                <div className="text-white/80">Founding Mums Cohort</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">Sep</div>
                <div className="text-white/80">2025 Launch</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">Free</div>
                <div className="text-white/80">Early Access</div>
              </div>
            </div>
          </div>

          {/* Happy Mom Image - 1/2 width as background */}
          <div 
            className="min-h-[600px] bg-cover bg-center bg-no-repeat rounded-lg"
            style={{
              backgroundImage: 'url(https://app.trickle.so/storage/public/images/usr_1443ba33e0000001/ccad20a2-cad0-45ae-9867-cc80005906c2.png)'
            }}
          >
          </div>
        </div>
      </div>
    </section>
  );
}