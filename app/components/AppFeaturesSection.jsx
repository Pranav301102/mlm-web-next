export default function AppFeaturesSection() {
  const features = [
    {
      icon: "📅",
      title: "Daily Chaos Manager",
      description: "Transform your hectic schedule into organized flow. Smart reminders, family coordination, and seamless daily management.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: "📈",
      title: "Career Advancement Hub", 
      description: "Strategic guidance for promotions, salary negotiations, and professional growth. Build your path to success.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: "💰",
      title: "Financial Wellness Planner",
      description: "Strengthen your financial future with budgeting tools, investment guidance, and long-term wealth building strategies.",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: "💜",
      title: "Community & Wellbeing",
      description: "Connect with supportive mums, access wellness resources, and prioritize your mental and physical health.",
      color: "bg-pink-100 text-pink-600"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Your Personal Concierge Features
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to create a beautiful, fulfilling life as a working mother
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${feature.color}`}>
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 bg-yellow-100 px-6 py-3 rounded-full">
            <span className="text-yellow-600">⏰</span>
            <span className="text-yellow-800 font-medium">Launching September 2025 · Early access starting soon</span>
          </div>
        </div>
      </div>
    </section>
  );
}
