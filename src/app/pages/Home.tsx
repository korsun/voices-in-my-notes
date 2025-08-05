interface Feature {
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    title: 'TypeScript',
    description: 'Enjoy the best of modern JavaScript with TypeScript.',
  },
  {
    title: 'React',
    description: 'Build reusable components with React.',
  },
  {
    title: 'Tailwind CSS',
    description: 'Style your components with Tailwind CSS.',
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="heading-2 text-hover">Welcome to the App</h1>
        <p className="mt-6 body-1">
          A modern single-page application template with Vite, React, TypeScript, ESLint, and
          Tailwind CSS.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="p-6 bg-white rounded-custom shadow">
            <h3 className="heading-3">{feature.title}</h3>
            <p className="mt-2 body-2">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
