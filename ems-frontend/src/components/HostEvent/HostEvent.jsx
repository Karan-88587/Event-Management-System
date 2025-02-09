import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const EventForm = () => {
  const secretKey = import.meta.env.VITE_APP_BACKEND_URL;
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const { eventId } = useParams(); // if present, we're in edit mode

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  // State for event images (using base64 for preview)
  const [eventImages, setEventImages] = useState([]);

  // If in edit mode, fetch the event data and populate the form
  useEffect(() => {
    if (eventId) {
      axios
        .get(`${secretKey}/event/event/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const eventData = res.data.data;
          // Prepopulate form fields
          setValue('eventName', eventData.eventName);
          setValue('eventDate', new Date(eventData.eventDate).toISOString().split('T')[0]); // format as YYYY-MM-DD
          setValue('eventTime', eventData.eventTime);
          setValue('eventLocation', eventData.eventLocation);
          setValue('eventCategory', eventData.eventCategory);
          setValue('eventDescription', eventData.eventDescription);
          // For editing, display the existing images (if any)
          if (eventData.eventImages && eventData.eventImages.length > 0) {
            // Here we're using the image URLs for preview.
            setEventImages(eventData.eventImages.map((img) => img.url));
          }
        })
        .catch((error) => {
          console.error('Error fetching event data for edit:', error);
          Swal.fire('Error', 'Failed to fetch event data.', 'error');
        });
    }
  }, [eventId, secretKey, token, setValue]);

  // Convert file to base64 for preview (or later upload)
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle file input change
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    const imagesArray = [];

    // Convert all selected files to base64
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64 = await convertToBase64(file);
      imagesArray.push(base64);
    }
    setEventImages(imagesArray);
  };

  // Submit handler for both add and edit
  const onSubmit = async (data) => {
    try {
      const eventData = {
        ...data,
        eventOrganizer: `${user.firstName} ${user.lastName}`,
        eventImages, // array of base64 images (or new images)
      };

      if (eventId) {
        // Edit mode: update the event
        await axios.put(`${secretKey}/event/update-event/${eventId}`, eventData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire('Success', 'Event updated successfully!', 'success');
      } else {
        // Add mode: create a new event
        await axios.post(`${secretKey}/event/create`, eventData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire('Success', 'Event hosted successfully!', 'success');
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Error hosting/updating event:', error);
      Swal.fire('Error', 'Failed to host/update event. Please try again.', 'error');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-slate-800 to-slate-900">
        <p className="text-white text-xl">Please login to host an event.</p>
        <Link
          to="/"
          className="text-xl text-amber-500 font-semibold hover:underline hover:text-amber-600 transition-all"
        >
          Login Here
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-800 to-slate-900 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-slate-700 rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          {eventId ? 'Edit Event' : 'Host an Event'}
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Event Name */}
          <div>
            <label htmlFor="eventName" className="block text-sm font-medium text-gray-300">
              Event Name
            </label>
            <input
              type="text"
              id="eventName"
              placeholder="Enter event name"
              {...register('eventName', { required: 'Event name is required' })}
              className={`mt-1 block w-full px-4 py-3 bg-slate-800 border ${
                errors.eventName ? 'border-red-500' : 'border-slate-600'
              } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
            />
            {errors.eventName && <p className="mt-2 text-sm text-red-500">{errors.eventName.message}</p>}
          </div>

          {/* Event Date & Time */}
          <div className="sm:flex sm:gap-4 max-sm:space-y-6">
            <div className="sm:w-1/2">
              <label htmlFor="eventDate" className="block text-sm font-medium text-gray-300">
                Event Date
              </label>
              <input
                type="date"
                id="eventDate"
                {...register('eventDate', { required: 'Event date is required' })}
                className={`mt-1 block w-full px-4 py-3 bg-slate-800 border ${
                  errors.eventDate ? 'border-red-500' : 'border-slate-600'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
              />
              {errors.eventDate && <p className="mt-2 text-sm text-red-500">{errors.eventDate.message}</p>}
            </div>

            <div className="sm:w-1/2">
              <label htmlFor="eventTime" className="block text-sm font-medium text-gray-300">
                Event Time
              </label>
              <input
                type="time"
                id="eventTime"
                {...register('eventTime', { required: 'Event time is required' })}
                className={`mt-1 block w-full px-4 py-3 bg-slate-800 border ${
                  errors.eventTime ? 'border-red-500' : 'border-slate-600'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
              />
              {errors.eventTime && <p className="mt-2 text-sm text-red-500">{errors.eventTime.message}</p>}
            </div>
          </div>

          {/* Event Location & Category */}
          <div className="sm:flex sm:gap-4 max-sm:space-y-6">
            <div className="sm:w-1/2">
              <label htmlFor="eventLocation" className="block text-sm font-medium text-gray-300">
                Event Location
              </label>
              <input
                type="text"
                id="eventLocation"
                placeholder="Enter event location"
                {...register('eventLocation', { required: 'Event location is required' })}
                className={`mt-1 block w-full px-4 py-3 bg-slate-800 border ${
                  errors.eventLocation ? 'border-red-500' : 'border-slate-600'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
              />
              {errors.eventLocation && <p className="mt-2 text-sm text-red-500">{errors.eventLocation.message}</p>}
            </div>

            <div className="sm:w-1/2">
              <label htmlFor="eventCategory" className="block text-sm font-medium text-gray-300">
                Event Category
              </label>
              <select
                id="eventCategory"
                {...register('eventCategory', { required: 'Event category is required' })}
                className={`mt-1 block w-full px-4 py-3 bg-slate-800 border ${
                  errors.eventCategory ? 'border-red-500' : 'border-slate-600'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
              >
                <option value="">Select category</option>
                <option value="Conference">Conference</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Party">Party</option>
                <option value="Concert">Concert</option>
                <option value="Other">Other</option>
              </select>
              {errors.eventCategory && <p className="mt-2 text-sm text-red-500">{errors.eventCategory.message}</p>}
            </div>
          </div>

          {/* Event Images */}
          <div>
            <label htmlFor="eventImages" className="block text-sm font-medium text-gray-300">
              Event Images
            </label>
            <input
              type="file"
              className="mt-1 block w-full text-white border-0 bg-slate-800 cursor-pointer p-3"
              id="eventImages"
              onChange={handleImageUpload}
              multiple
            />
            <div className="mt-4 flex flex-wrap gap-4">
              {eventImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Event Image ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>

          {/* Event Description */}
          <div>
            <label htmlFor="eventDescription" className="block text-sm font-medium text-gray-300">
              Event Description
            </label>
            <textarea
              id="eventDescription"
              placeholder="Enter event description"
              {...register('eventDescription')}
              className={`mt-1 block w-full px-4 py-3 bg-slate-800 border ${
                errors.eventDescription ? 'border-red-500' : 'border-slate-600'
              } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer w-full flex justify-center items-center px-4 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-500 transition-all"
          >
            {isSubmitting ? (
              <svg
                aria-hidden="true"
                className="inline w-6 h-6 text-gray-200 animate-spin fill-white"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
            ) : (
              eventId ? 'Update Event' : 'Host Event'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventForm;