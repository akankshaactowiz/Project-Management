import { useNavigate } from 'react-router-dom';
import ErrorImage from '../assets/error-image.svg'; // Use the uploaded image here

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className=" w-full p-8 flex flex-col md:flex-row items-center gap-8">
        {/* Image Section */}
        <div className="flex-shrink-0">
          <img
            src={ErrorImage}
            alt="Page not found"
            className="w-64 h-64"
          />
        </div>

        {/* Text Section */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">Opps!</h1>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            We Can't Seem to Find The Page You're Looking For.
          </h2>
          <p className="text-gray-500 mb-6">
            Oops! The page you are looking for does not exist. It might have been moved or deleted.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Go To Home
          </button>
        </div>
      </div>
    </div>
  );
}
