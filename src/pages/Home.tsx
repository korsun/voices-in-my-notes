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
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Welcome to the SPA Template
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          A modern single-page application template with Vite, React, TypeScript, ESLint, and Tailwind CSS.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="p-6 bg-white rounded-lg shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
            <p className="mt-2 text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
