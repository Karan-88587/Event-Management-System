import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import eventImage from '../../assets/event.webp';

const Dashboard = () => {

  const secretKey = import.meta.env.VITE_APP_BACKEND_URL;
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const organizer = `${user?.firstName} ${user?.lastName}`;

  const [events, setEvents] = useState([]);
  const [category, setCategory] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchEvents = async () => {
    try {
      const res = await axios(`${secretKey}/event/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          category,
          eventDate,
          searchQuery,
        },
      });
      // console.log("Fetched events :", res.data.data);
      setEvents(res.data.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [category, eventDate, searchQuery]);

  const deleteEvent = async (eventId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    })
    .then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(`${secretKey}/event/delete-event/${eventId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          Swal.fire('Deleted!', 'Event has been deleted.', 'success');
          fetchEvents();
        } catch (error) {
          console.log('Error deleting event:', error);
          Swal.fire('Error', 'Failed to delete event. Please try again.', 'error');
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-800 to-slate-900 p-6">
      {/* Filter Section */}
      <div className="max-w-7xl mx-auto mb-8 bg-slate-700 rounded-lg p-4 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search events by name..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <select
            className="bg-slate-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All</option>
            <option value="Conference">Conference</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
            <option value="Party">Party</option>
            <option value="Concert">Concert</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="date"
            className="bg-slate-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length > 0 ? (
          events.map((event) => (
            <div
              key={event._id}
              className="bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Image Section */}
              <div className="relative aspect-video">
                <img
                  className="w-full h-full object-cover"
                  src={event?.eventImages[0]?.url || eventImage}
                  alt={event.eventName}
                />
                <span className="absolute top-2 right-2 bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {event.eventCategory}
                </span>
              </div>

              {/* Content Section */}
              <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold text-white truncate">
                    {event.eventName}
                  </h2>
                  {event.eventOrganizer === organizer && <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/edit-event/${event._id}`)}
                      className="cursor-pointer text-amber-500 hover:text-amber-700"
                      title="Edit Event"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteEvent(event._id)}
                      className="cursor-pointer text-amber-500 hover:text-amber-700"
                      title="Delete Event"
                    >
                      <FaTrash />
                    </button>
                  </div>}
                </div>

                <div className="space-y-2 text-gray-400">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="flex-shrink-0" />
                    <span>{new Date(event.eventDate).toLocaleDateString()} • {event.eventTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="flex-shrink-0" />
                    <span className="truncate">{event.eventLocation}</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-amber-500 font-medium">
                    Organized by: {event.eventOrganizer}
                  </span>
                  <button className="cursor-pointer px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors" onClick={() => navigate(`/event/${event._id}`)}>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-xl text-gray-300">No events found.
              <Link
                to="/host-event"
                className="text-xl text-amber-500 font-semibold hover:underline hover:text-amber-600 transition-all"
              >
                Create one now!
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;