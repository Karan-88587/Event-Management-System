import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

const Event = () => {
  const secretKey = import.meta.env.VITE_APP_BACKEND_URL;
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch event details by ID
  const fetchEventById = async () => {
    try {
      const res = await axios.get(`${secretKey}/event/event/${eventId}`);
    //   console.log('Fetched event by ID:', res.data.data);
      setEvent(res.data.data);
    } catch (error) {
      console.error('Error fetching event by ID:', error);
    }
  };

  useEffect(() => {
    fetchEventById();
    // Reset slider index when event changes
    setCurrentIndex(0);
  }, [eventId]);

  // Slider functions for previous/next image
  const prevImage = () => {
    if (!event || !event.eventImages || event.eventImages.length === 0) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? event.eventImages.length - 1 : prevIndex - 1
    );
  };

  const nextImage = () => {
    if (!event || !event.eventImages || event.eventImages.length === 0) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === event.eventImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-white text-xl">Loading event details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto bg-slate-800 rounded-lg shadow-lg p-6">
        {/* Event Images Slider */}
        <div className="relative">
          {event.eventImages && event.eventImages.length > 0 ? (
            <img
              src={event.eventImages[currentIndex].url}
              alt={`Event ${event.eventName} - Slide ${currentIndex + 1}`}
              className="w-full h-96 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-96 bg-slate-700 flex items-center justify-center rounded-lg">
              <p className="text-gray-300">No images available</p>
            </div>
          )}

          {/* Show slider buttons only if more than one image is available */}
          {event.eventImages && event.eventImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="cursor-pointer absolute top-1/2 left-4 transform -translate-y-1/2 bg-amber-600 text-white p-2 rounded-full hover:bg-amber-700"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={nextImage}
                className="cursor-pointer absolute top-1/2 right-4 transform -translate-y-1/2 bg-amber-600 text-white p-2 rounded-full hover:bg-amber-700"
              >
                <FaChevronRight />
              </button>
            </>
          )}
        </div>

        {/* Event Details */}
        <div className="mt-6 text-white">
          <h1 className="text-3xl font-bold mb-4">{event.eventName}</h1>
          <p className="mb-4">{event.eventDescription}</p>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2">
              <FaCalendarAlt />
              <span>
                {new Date(event.eventDate).toLocaleDateString()} • {event.eventTime}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt />
              <span>{event.eventLocation}</span>
            </div>
          </div>
          <div className="mb-4">
            <span className="text-sm text-amber-500 font-medium">
              Category: {event.eventCategory}
            </span>
          </div>
          <div>
            <span className="text-sm text-amber-500 font-medium">
              Organized by: {event.eventOrganizer}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Event;