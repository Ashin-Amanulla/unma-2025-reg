import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, LazyMotion, domAnimation } from "framer-motion";
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
  TicketIcon,
  CameraIcon,
  MusicalNoteIcon,
  SparklesIcon,
  ArrowRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

// Add Google Maps imports
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

// Add map styles
const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "1rem",
};

const center = {
  lat: 10.1517, // CIAL Convention Center coordinates
  lng: 76.3924,
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    {
      featureType: "all",
      elementType: "labels.text.fill",
      stylers: [{ color: "#7c93a3" }, { lightness: "-10" }],
    },
    {
      featureType: "administrative.country",
      elementType: "geometry",
      stylers: [{ visibility: "on" }],
    },
    {
      featureType: "administrative.province",
      elementType: "geometry.stroke",
      stylers: [{ color: "#ffffff" }, { visibility: "on" }, { weight: 1 }],
    },
    {
      featureType: "landscape",
      elementType: "geometry.fill",
      stylers: [{ color: "#dde3e3" }],
    },
    {
      featureType: "road",
      elementType: "geometry.fill",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#d9d9d9" }],
    },
    {
      featureType: "water",
      elementType: "geometry.fill",
      stylers: [{ color: "#a3c7df" }],
    },
  ],
};

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2025-08-30T09:00:00");

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-flow-col gap-4 md:gap-6 text-center auto-cols-max mx-auto">
      {[
        { value: timeLeft.days, label: "Days" },
        { value: timeLeft.hours, label: "Hours" },
        { value: timeLeft.minutes, label: "Minutes" },
        { value: timeLeft.seconds, label: "Seconds" },
      ].map((item, index) => (
        <div
          key={index}
          className="flex flex-col p-2 md:p-4 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/20 shadow-lg"
        >
          <span className="countdown font-mono text-3xl md:text-5xl lg:text-6xl font-bold text-white">
            {item.value.toString().padStart(2, "0")}
          </span>
          <span className="text-xs md:text-sm lg:text-lg text-white/80 mt-1 md:mt-2">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const Home = () => {
  const eventDetailsRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaqItems, setOpenFaqItems] = useState(new Set([0])); // Start with transportation FAQ open
  const [showCalendarDropdown, setShowCalendarDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close calendar dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCalendarDropdown && !event.target.closest(".calendar-dropdown")) {
        setShowCalendarDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendarDropdown]);

  const scrollToEventDetails = () => {
    eventDetailsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleFaqItem = (index) => {
    setOpenFaqItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Calendar helper functions
  const formatDateForCalendar = (date, time) => {
    // Convert to ISO format for calendar APIs
    const eventDate = new Date(`${date}T${time}:00`);
    return eventDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const generateCalendarUrls = () => {
    const eventDetails = {
      title: "UNMA Summit 2025 - Reuniting Navodayan Memories",
      startDate: "2025-08-30",
      startTime: "09:00",
      endTime: "20:00",
      location:
        "CIAL Trade Fair and Exhibition Center, Nedumbassery, Kochi, Kerala, India",
      description:
        "Join us for an unforgettable reunion of Jawahar Navodaya Vidyalaya Alumni and Staff. Reconnect with school friends, share stories, and create new memories. Event includes cultural programs, networking sessions, workshops, and much more!",
    };

    const startDateTime = formatDateForCalendar(
      eventDetails.startDate,
      eventDetails.startTime
    );
    const endDateTime = formatDateForCalendar(
      eventDetails.startDate,
      eventDetails.endTime
    );

    return {
      google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        eventDetails.title
      )}&dates=${startDateTime}/${endDateTime}&details=${encodeURIComponent(
        eventDetails.description
      )}&location=${encodeURIComponent(eventDetails.location)}`,

      outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
        eventDetails.title
      )}&startdt=${startDateTime}&enddt=${endDateTime}&body=${encodeURIComponent(
        eventDetails.description
      )}&location=${encodeURIComponent(eventDetails.location)}`,

      apple: `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:https://unma.in
DTSTART:${startDateTime}
DTEND:${endDateTime}
SUMMARY:${eventDetails.title}
DESCRIPTION:${eventDetails.description}
LOCATION:${eventDetails.location}
END:VEVENT
END:VCALENDAR`.replace(/\n/g, "%0A"),
    };
  };

  const handleAddToCalendar = (provider) => {
    const urls = generateCalendarUrls();

    if (provider === "apple") {
      // For Apple Calendar, create a downloadable .ics file
      const link = document.createElement("a");
      link.href = urls.apple;
      link.download = "UNMA-Summit-2025.ics";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For Google and Outlook, open in new window
      window.open(urls[provider], "_blank");
    }

    setShowCalendarDropdown(false);
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="bg-gradient-to-b from-indigo-950 via-primary to-indigo-900">
        {/* Hero Section */}
        <section className="relative min-h-screen pt-16 pb-16">
          {/* Animated shapes background */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/80 via-primary/60 to-indigo-900/80 z-10"></div>

            {/* Animated shapes */}
            <div className="absolute top-0 left-0 w-full h-full z-0">
              <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-400/10 rounded-full mix-blend-overlay filter blur-xl animate-float"></div>
              <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500/10 rounded-full mix-blend-overlay filter blur-xl animate-float-delay"></div>
              <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full mix-blend-overlay filter blur-xl animate-float-slow"></div>
              <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-overlay filter blur-xl animate-float-delay-slow"></div>
            </div>

            {/* Confetti effect */}
            <div className="absolute inset-0 z-20">
              {Array(20)
                .fill()
                .map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-2 h-8 bg-white/20 rounded-full`}
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      transform: `rotate(${Math.random() * 360}deg)`,
                      opacity: Math.random() * 0.5 + 0.3,
                      animation: `float ${
                        Math.random() * 10 + 15
                      }s linear infinite`,
                    }}
                  ></div>
                ))}
              {Array(30)
                .fill()
                .map((_, i) => (
                  <div
                    key={i + 100}
                    className={`absolute w-2 h-2 rounded-full`}
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      backgroundColor: [
                        "#FFDD00",
                        "#FF2E63",
                        "#3DB2FF",
                        "#3FEEE6",
                        "#FC5C9C",
                      ][Math.floor(Math.random() * 5)],
                      opacity: Math.random() * 0.5 + 0.3,
                      animation: `float ${
                        Math.random() * 10 + 10
                      }s linear infinite`,
                    }}
                  ></div>
                ))}
            </div>
          </div>

          {/* Content */}
          <div className="container relative z-30">
            <div className="max-w-7xl mx-auto">
              {/* Event Badge */}
              <div className="flex justify-center mb-8">
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-full border border-white/20 shadow-xl inline-flex items-center gap-3"
                >
                  <span className="text-yellow-400 text-xl">★</span>
                  <span className="text-white font-bold tracking-wider">
                    United Navodayan Malayalee Association (UNMA )
                  </span>
                  <span className="text-yellow-400 text-xl">★</span>
                </motion.div>
              </div>

              {/* Title */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center mb-12"
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-300 to-yellow-400">
                    SUMMIT 2025
                  </span>
                  <br />
                  <span className="text-white">
                    Reuniting Navodayan Memories
                  </span>
                </h1>
                <p className="text-xl text-white/80 leading-relaxed max-w-3xl mx-auto">
                  Let's have a memorable gathering of Jawahar Navodaya Vidyalaya
                  Alumni and Staff from 14 districts of Kerala, Mahe,
                  Lakshadweep, and other JNV's Alumni/Staff residing in Kerala.
                  Reconnect with school friends and staff, share stories, and
                  create new memories.
                </p>
              </motion.div>

              {/* Countdown Timer - Full Width */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mb-12 bg-white/10 backdrop-blur-md p-4 md:p-8 rounded-2xl border border-white/20 shadow-xl"
              >
                <h3 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-center text-white">
                  Event Starts In
                </h3>
                <div className="flex justify-center">
                  <CountdownTimer />
                </div>
              </motion.div>

              {/* Three Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* When Card */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl flex items-center gap-5"
                >
                  <div className="p-3 rounded-xl bg-white/10 flex-shrink-0">
                    <CalendarIcon className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-semibold">When</h3>
                    <p className="text-white text-xl font-bold">
                      Saturday, August 30, 2025
                    </p>
                    <p className="text-white/80">9:00 AM - 8:00 PM</p>
                  </div>
                </motion.div>

                {/* Where Card */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl flex items-center gap-5"
                >
                  <div className="p-3 rounded-xl bg-white/10 flex-shrink-0">
                    <MapPinIcon className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-semibold">Where</h3>
                    <p className="text-white text-xl font-bold">
                      CIAL Trade Fair and Exhibition Center
                    </p>
                    <p className="text-white/80">Nedumbassery, Kochi</p>
                  </div>
                </motion.div>

                {/* Who Card */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl flex items-center gap-5"
                >
                  <div className="p-3 rounded-xl bg-white/10 flex-shrink-0">
                    <UserGroupIcon className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-semibold">Who</h3>
                    <p className="text-white text-xl font-bold">
                      Navodayans and Staff
                    </p>
                    <p className="text-white/80">Family Members Welcome</p>
                  </div>
                </motion.div>
              </div>

              {/* Map - Now Full Width */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="mb-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden flex flex-col"
              >
                <div className="relative w-full h-[500px]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3927.2717890166828!2d76.3762165!3d10.1585489!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b08061b468975ab%3A0xdeeba8a7f2436d7d!2sCIAL%20Convention%20Centre!5e0!3m2!1sen!2sae!4v1743789387189!5m2!1sen!2sae"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                  ></iframe>
                </div>
                <div className="p-4 border-t border-white/10 flex flex-wrap justify-between items-center mt-auto gap-4">
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="w-5 h-5 text-yellow-400" />
                    <span className="text-white">
                      CIAL Trade Fair and Exhibition Center, Nedumbassery, Kochi
                    </span>
                  </div>
                  <a
                    href="https://g.co/kgs/rvWmCBK"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all duration-300 text-sm"
                  >
                    <span>Get Directions</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto"
              >
                <Link
                  to="/register"
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-pink-500 hover:from-yellow-500 hover:to-pink-600 px-8 py-4 text-lg font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 text-indigo-950"
                >
                  Register Now
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <button
                  onClick={scrollToEventDetails}
                  className="flex-1 border-2 border-white/50 hover:border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Learn More
                  <ChevronDownIcon className="w-5 h-5" />
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Event Highlights */}
        <section className="py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="container">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-6 py-2.5 mb-4 text-sm font-semibold tracking-wider text-white uppercase bg-gradient-to-r from-primary to-primary-dark rounded-full shadow-md">
                Highlights
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                What to <span className="text-primary">Expect</span>
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-gray-600">
                Join us for an unforgettable day filled with nostalgia,
                connections, and celebration of our shared Navodayan heritage.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {[
                {
                  icon: <UserGroupIcon className="w-10 h-10 text-primary" />,
                  title: "Reconnect",
                  description:
                    "Meet your batchmates and teachers after years. Share stories and relive the golden days.",
                  color: "from-blue-50 to-indigo-50",
                  iconBg: "from-blue-400/20 to-indigo-400/20",
                  iconGradient: "from-blue-400 to-indigo-500",
                  delay: 0,
                },
                {
                  icon: <MusicalNoteIcon className="w-10 h-10 text-primary" />,
                  title: "Cultural Events",
                  description:
                    "Enjoy performances, music, and cultural activities that celebrate the Navodaya spirit.",
                  color: "from-purple-50 to-pink-50",
                  iconBg: "from-purple-400/20 to-pink-400/20",
                  iconGradient: "from-purple-400 to-pink-500",
                  delay: 0.1,
                },
                {
                  icon: <MapPinIcon className="w-10 h-10 text-primary" />,
                  title: "Networking",
                  description:
                    "Connect with alumni from different professions and expand your network.",
                  color: "from-green-50 to-teal-50",
                  iconBg: "from-green-400/20 to-teal-400/20",
                  iconGradient: "from-green-400 to-teal-500",
                  delay: 0.2,
                },
                {
                  icon: <CalendarIcon className="w-10 h-10 text-primary" />,
                  title: "Workshops",
                  description:
                    "Participate in interactive sessions and workshops on various topics.",
                  color: "from-yellow-50 to-amber-50",
                  iconBg: "from-yellow-400/20 to-amber-400/20",
                  iconGradient: "from-yellow-400 to-amber-500",
                  delay: 0.3,
                },
                {
                  icon: <CameraIcon className="w-10 h-10 text-primary" />,
                  title: "Photo Gallery",
                  description:
                    "Capture memories with professional photography and share them with the community.",
                  color: "from-red-50 to-orange-50",
                  iconBg: "from-red-400/20 to-orange-400/20",
                  iconGradient: "from-red-400 to-orange-500",
                  delay: 0.4,
                },
                {
                  icon: <TicketIcon className="w-10 h-10 text-primary" />,
                  title: "Raffle Draw",
                  description:
                    "Win exciting prizes in our special raffle draw for registered participants.",
                  color: "from-pink-50 to-rose-50",
                  iconBg: "from-pink-400/20 to-rose-400/20",
                  iconGradient: "from-pink-400 to-rose-500",
                  delay: 0.5,
                },
                {
                  icon: <SparklesIcon className="w-10 h-10 text-primary" />,
                  title: "Awards Ceremony",
                  description:
                    "Recognize outstanding achievements of alumni in various fields.",
                  color: "from-cyan-50 to-blue-50",
                  iconBg: "from-cyan-400/20 to-blue-400/20",
                  iconGradient: "from-cyan-400 to-blue-500",
                  delay: 0.6,
                },
                {
                  icon: <ClockIcon className="w-10 h-10 text-primary" />,
                  title: "Time Capsule",
                  description:
                    "Contribute to a special time capsule that will be opened at the next reunion.",
                  color: "from-indigo-50 to-violet-50",
                  iconBg: "from-indigo-400/20 to-violet-400/20",
                  iconGradient: "from-indigo-400 to-violet-500",
                  delay: 0.7,
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: item.delay }}
                  viewport={{ once: true }}
                  className={`group rounded-2xl p-1 bg-gradient-to-br ${item.color} hover:shadow-xl transition-all duration-500`}
                >
                  <div className="bg-white h-full rounded-xl p-7 flex flex-col">
                    <div
                      className={`mb-6 w-16 h-16 rounded-xl bg-gradient-to-br ${item.iconBg} flex items-center justify-center relative group-hover:scale-110 transition-transform duration-300`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl blur-sm"></div>
                      <div
                        className={`text-transparent bg-clip-text bg-gradient-to-br ${item.iconGradient}`}
                      >
                        {item.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Program Schedule */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-indigo-50">
          <div className="container">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block px-6 py-2.5 mb-4 text-sm font-semibold tracking-wider text-white uppercase bg-gradient-to-r from-primary to-primary-dark rounded-full shadow-md">
                Schedule
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Summit 2025 <span className="text-primary">Program</span>
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-gray-600">
                A full day of reconnection, celebration, and memories - August
                30, 2025
              </p>
            </motion.div>

            {/* Horizontal scrollable timeline for mobile, grid for desktop */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Desktop Grid Layout */}
              <div className="hidden lg:grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {[
                  {
                    time: "9:00 - 10:00 AM",
                    title: "Registration & Networking",
                    icon: <UserGroupIcon className="w-5 h-5" />,
                    color: "from-blue-500 to-indigo-600",
                  },
                  {
                    time: "10:00 AM - 12:00 PM",
                    title: "Public Function",
                    icon: <SparklesIcon className="w-5 h-5" />,
                    color: "from-purple-500 to-pink-600",
                  },
                  {
                    time: "12:00 - 12:30 PM",
                    title: "Group Photos",
                    icon: <CameraIcon className="w-5 h-5" />,
                    color: "from-green-500 to-teal-600",
                  },
                  {
                    time: "12:30 - 1:00 PM",
                    title: "Meet & Greet, Stalls Visit",
                    icon: <MapPinIcon className="w-5 h-5" />,
                    color: "from-yellow-500 to-orange-600",
                  },
                  {
                    time: "1:00 - 2:00 PM",
                    title: "Lunch Break",
                    icon: (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="8"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    ),
                    color: "from-red-500 to-pink-600",
                  },
                  {
                    time: "2:00 - 5:30 PM",
                    title: "Cultural Programs",
                    icon: <MusicalNoteIcon className="w-5 h-5" />,
                    color: "from-indigo-500 to-purple-600",
                  },
                  {
                    time: "5:30 - 6:00 PM",
                    title: "Tea & Networking",
                    icon: (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.5 8a2.5 2.5 0 00-5 0c0 .92.498 1.725 1.238 2.166C14.526 10.758 15 11.845 15 13c0 .345-.027.683-.08 1.013a1.5 1.5 0 001.08 1.487c.673 0 1.22-.548 1.22-1.22V13c0-1.657 1.343-3 3-3s3 1.343 3 3c0 .345-.027.683-.08 1.013a1.5 1.5 0 001.08 1.487c.673 0 1.22-.548 1.22-1.22V13c0-1.657-1.343-3-3-3z"
                        />
                      </svg>
                    ),
                    color: "from-teal-500 to-cyan-600",
                  },
                  {
                    time: "6:00 - 8:00 PM",
                    title: "Live Entertainment",
                    icon: (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                      </svg>
                    ),
                    color: "from-rose-500 to-pink-600",
                  },
                  {
                    time: "8:00 PM",
                    title: "Closing Ceremony",
                    icon: (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    ),
                    color: "from-amber-500 to-yellow-600",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="group cursor-pointer"
                  >
                    <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 h-full transform hover:scale-105 hover:-translate-y-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`p-2 rounded-lg bg-gradient-to-br ${item.color} text-white shadow-sm group-hover:scale-110 transition-transform duration-300`}
                        >
                          {item.icon}
                        </div>
                        <div>
                          <p
                            className={`text-xs font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent uppercase tracking-wide`}
                          >
                            {item.time}
                          </p>
                          <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors duration-300">
                            {item.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Mobile/Tablet Horizontal Scroll */}
              <div className="lg:hidden">
                <div className="flex gap-4 overflow-x-auto pb-4 px-4 -mx-4 scrollbar-hide">
                  {[
                    {
                      time: "9:00 - 10:00 AM",
                      title: "Registration & Networking",
                      icon: <UserGroupIcon className="w-5 h-5" />,
                      color: "from-blue-500 to-indigo-600",
                    },
                    {
                      time: "10:00 AM - 12:00 PM",
                      title: "Public Function",
                      icon: <SparklesIcon className="w-5 h-5" />,
                      color: "from-purple-500 to-pink-600",
                    },
                    {
                      time: "12:00 - 12:30 PM",
                      title: "Group Photos",
                      icon: <CameraIcon className="w-5 h-5" />,
                      color: "from-green-500 to-teal-600",
                    },
                    {
                      time: "12:30 - 1:00 PM",
                      title: "Meet & Greet",
                      icon: <MapPinIcon className="w-5 h-5" />,
                      color: "from-yellow-500 to-orange-600",
                    },
                    {
                      time: "1:00 - 2:00 PM",
                      title: "Lunch Break",
                      icon: (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="8"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      ),
                      color: "from-red-500 to-pink-600",
                    },
                    {
                      time: "2:00 - 5:30 PM",
                      title: "Cultural Programs",
                      icon: <MusicalNoteIcon className="w-5 h-5" />,
                      color: "from-indigo-500 to-purple-600",
                    },
                    {
                      time: "5:30 - 6:00 PM",
                      title: "Tea & Networking",
                      icon: (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.5 8a2.5 2.5 0 00-5 0c0 .92.498 1.725 1.238 2.166C14.526 10.758 15 11.845 15 13c0 .345-.027.683-.08 1.013a1.5 1.5 0 001.08 1.487c.673 0 1.22-.548 1.22-1.22V13c0-1.657 1.343-3 3-3s3 1.343 3 3c0 .345-.027.683-.08 1.013a1.5 1.5 0 001.08 1.487c.673 0 1.22-.548 1.22-1.22V13c0-1.657-1.343-3-3-3z"
                          />
                        </svg>
                      ),
                      color: "from-teal-500 to-cyan-600",
                    },
                    {
                      time: "6:00 - 8:00 PM",
                      title: "Live Entertainment",
                      icon: (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                          />
                        </svg>
                      ),
                      color: "from-rose-500 to-pink-600",
                    },
                    {
                      time: "8:00 PM",
                      title: "Closing",
                      icon: (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      ),
                      color: "from-amber-500 to-yellow-600",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-40 bg-white rounded-xl p-3 shadow-md border border-gray-100 hover:shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`p-1.5 rounded-lg bg-gradient-to-br ${item.color} text-white shadow-sm group-hover:scale-110 transition-transform duration-300`}
                        >
                          {item.icon}
                        </div>
                      </div>
                      <p
                        className={`text-xs font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent uppercase tracking-wide mb-1`}
                      >
                        {item.time}
                      </p>
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors duration-300">
                        {item.title}
                      </h3>
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">
                  ← Swipe to view all events →
                </p>
              </div>
            </motion.div>

            {/* Compact Call to action */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center mt-8"
            >
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Register for Summit 2025
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Event Details */}
        <section
          ref={eventDetailsRef}
          id="event-details"
          className="py-24 bg-gradient-to-br from-primary/5 to-primary/10"
        >
          <div className="container">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-6 py-2.5 mb-4 text-sm font-semibold tracking-wider text-white uppercase bg-gradient-to-r from-primary to-primary-dark rounded-full shadow-md">
                Key Information
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-white-300 mb-6">
                Event <span className="text-white-900">Details</span>
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-white">
                Everything you need to know about the UNMA 2025 reunion. Mark
                your calendar and prepare for an unforgettable experience.
              </p>
            </motion.div>

            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100"
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Left Column: Beautiful Image */}
                  <div className="relative h-full min-h-[300px] bg-gradient-to-br from-primary to-primary-dark overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
                      <div className="p-4 rounded-full bg-white/20 backdrop-blur-md mb-4">
                        <CalendarIcon className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-2">
                        August 30, 2025
                      </h3>
                      <p className="text-white/90 text-xl">9:00 AM - 8:00 PM</p>
                      <div className="mt-8 flex justify-center">
                        <div className="relative calendar-dropdown">
                          <button
                            onClick={() =>
                              setShowCalendarDropdown(!showCalendarDropdown)
                            }
                            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md hover:bg-white/30 px-5 py-3 rounded-lg text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                          >
                            <CalendarIcon className="w-5 h-5" />
                            <span>Add to Calendar</span>
                            <ChevronDownIcon
                              className={`w-4 h-4 transition-transform duration-200 ${
                                showCalendarDropdown ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {/* Calendar Dropdown */}
                          {showCalendarDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px] z-50"
                            >
                              <div className="py-2">
                                <button
                                  onClick={() => handleAddToCalendar("google")}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 text-gray-700"
                                >
                                  <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">
                                      G
                                    </span>
                                  </div>
                                  <span>Google Calendar</span>
                                </button>

                                <button
                                  onClick={() => handleAddToCalendar("outlook")}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 text-gray-700"
                                >
                                  <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">
                                      O
                                    </span>
                                  </div>
                                  <span>Outlook Calendar</span>
                                </button>

                                <button
                                  onClick={() => handleAddToCalendar("apple")}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 text-gray-700"
                                >
                                  <div className="w-5 h-5 bg-gray-800 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">
                                      🍎
                                    </span>
                                  </div>
                                  <span>Apple Calendar (.ics)</span>
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Event Information */}
                  <div className="p-8 md:p-10">
                    <div className="space-y-8">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10 text-primary">
                          <MapPinIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold mb-2 text-gray-900">
                            Venue
                          </h4>
                          <p className="text-gray-800 font-medium text-lg">
                            CIAL Trade Fair and Exhibition Center
                          </p>
                          <p className="text-gray-600"> Nedumbassery, Kochi</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Detailed directions will be sent upon registration
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10 text-primary">
                          <UserGroupIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold mb-2 text-gray-900">
                            Who Can Attend
                          </h4>
                          <p className="text-gray-800 font-medium">
                            Alumni and Staff from JNVs of Kerala, Mahe and
                            Lakshadweep and other JNV's alumni /staff residing
                            in Kerala. Family members are welcome to join.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10 text-primary">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold mb-2 text-gray-900">
                            Registration
                          </h4>
                          <p className="text-gray-800 font-medium">
                            A nominal amount of Registration fee will be charged
                            based on head count.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-gray-200">
                      <h4 className="text-xl font-semibold mb-4 text-gray-900">
                        Additional Information
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-600">
                        {[
                          "Accommodation options for outstation alumni",
                          "Food and refreshments provided",
                          "Cultural performances and interactive sessions",
                          "Special arrangements for talent showcase",
                        ].map((info, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></span>
                            <span>{info}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-r from-primary to-primary-dark text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-5"></div>

          {/* Animated blobs */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute top-10 right-10 w-96 h-96 bg-white/5 rounded-full mix-blend-overlay filter blur-xl animate-float-slow"></div>
            <div className="absolute bottom-20 left-20 w-80 h-80 bg-white/5 rounded-full mix-blend-overlay filter blur-xl animate-float-delay"></div>
          </div>

          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/20 shadow-2xl text-center"
              >
                <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                  Ready to Join the Reunion?
                </h2>
                <p className="text-xl text-white/90 mb-10 leading-relaxed">
                  Don't miss this opportunity to reconnect with your Navodaya
                  family. Register now to secure your spot at UNMA 2025.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 bg-white text-primary hover:bg-white/90 px-8 py-4 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Register Today
                    <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                  {/* <Link
                    to="#event-details"
                    className="inline-flex items-center justify-center gap-2 border-2 border-white/70 hover:border-white hover:bg-white/10 px-8 py-4 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    View Details
                    <ChevronDownIcon className="w-5 h-5" />
                  </Link> */}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 bg-white">
          <div className="container">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-6 py-2.5 mb-4 text-sm font-semibold tracking-wider text-white uppercase bg-gradient-to-r from-primary to-primary-dark rounded-full shadow-md">
                Questions?
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Frequently Asked <span className="text-primary">Questions</span>
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-gray-600">
                Find answers to common questions about the UNMA 2025 event. If
                you can't find what you're looking for, feel free to{" "}
                <Link
                  to="/contact"
                  className="text-primary hover:text-primary-dark underline"
                >
                  contact us.
                </Link>
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              {[
                {
                  question: "How to report an Issue on Registration?",
                  answer: (
                    <>
                      Kindly use the{" "}
                      <Link
                        to="/report-issue"
                        className="text-primary hover:text-primary-dark underline"
                      >
                        report issue page
                      </Link>{" "}
                      in the registration page .
                    </>
                  ),
                },
                {
                  question:
                    "How should I fill the Transportation section during registration?",
                  answer: (
                    <div className="space-y-4">
                      <p>
                        To make your travel planning smoother and to help you
                        connect with fellow alumni traveling from distant
                        locations (especially from outside Kerala), please fill
                        in the relevant sections based on your travel needs.
                      </p>

                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded p-4">
                          <p className="font-semibold text-blue-800 mb-3">
                            Section A (Optional): Traveling from Outside Kerala
                            or Abroad
                          </p>
                          <p className="text-blue-700 mb-3">
                            If you're traveling to Kerala before the event date
                            and would like to connect with other alumni from
                            your city for group travel, please enter:
                          </p>
                          <ul className="text-blue-700 space-y-2 ml-4">
                            <li>
                              <strong>City of Departure:</strong> Make sure to
                              spell it exactly as it appears on railway/airline
                              systems (no abbreviations).
                            </li>
                            <li>
                              <strong>First Travel Date:</strong> The date you
                              plan to travel to Kerala.
                            </li>
                          </ul>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded p-4">
                          <p className="font-semibold text-green-800 mb-3">
                            Section B (Optional): Traveling to the Event Venue
                          </p>
                          <p className="text-green-700 mb-3">
                            If you are traveling on the day of the event from
                            any location to the venue, please fill this section
                            if:
                          </p>
                          <ul className="text-green-700 space-y-1 ml-4 mb-3">
                            <li>You need parking at the venue.</li>
                            <li>
                              You can offer a ride (and have vacant seats in
                              your vehicle).
                            </li>
                            <li>
                              You need a ride and are looking for ride-sharing
                              or a lift.
                            </li>
                          </ul>
                          <p className="text-green-700 mb-2">
                            <strong>In all cases, please provide:</strong>
                          </p>
                          <ul className="text-green-700 space-y-1 ml-4">
                            <li>
                              Your starting point's PIN code and landmark.
                            </li>
                          </ul>
                          <p className="text-green-700 mt-2 text-sm italic">
                            This will help us coordinate efficiently and connect
                            you with others traveling in your area.
                          </p>
                        </div>
                      </div>

                      <p className="font-medium text-center text-blue-600 mt-4">
                        Your input helps us organize group bookings for flights,
                        trains, buses, or ships, and coordinate local travel on
                        the day of the event. 🚗✈️🚂
                      </p>
                    </div>
                  ),
                },
                {
                  question: "Who can attend the UNMA 2025 event?",
                  answer:
                    "The event is open to all Alumni and Staff from JNVs of Kerala, Mahe and Lakshadweep and other JNV's alumni /staff residing in Kerala. You can also bring your immediate family members along.",
                },
                {
                  question: "How can I register for the event?",
                  answer:
                    "You can register through our online portal. Click on the 'Register' button and follow the instructions.",
                },
                {
                  question: "Is there a registration fee?",
                  answer:
                    "A nominal registration fee will be charged per person. However, as this is a fundraiser for UNMA's future activities, we encourage you to contribute according to your capacity.",
                },

                {
                  question:
                    "What if I'm from JNV  Alappuzha, Malappuram or Thrissur?",
                  answer:
                    "Alumni from these schools are advised to contact their respective alumni associations for their separate registration process.",
                },
                {
                  question: "Will accommodation be arranged?",
                  answer:
                    "Yes, we will connect you with accommodation options near the venue. You can specify your requirements during registration.",
                },
                {
                  question:
                    "During registration, I am getting an ' internal server error', what should I do?",
                  answer: (
                    <>
                      This could be related to network issues. Please refresh
                      the page and try again later. If the problem persists,{" "}
                      <Link
                        to="/report-issue"
                        className="text-primary hover:text-primary-dark underline"
                      >
                        report issue page
                      </Link>{" "}
                    </>
                  ),
                },
                {
                  question: "How do I submit a suggestion ?",
                  answer: (
                    <>
                      Kindly use the{" "}
                      <Link
                        to="/contact"
                        className="text-primary hover:text-primary-dark underline"
                      >
                        message box
                      </Link>{" "}
                      in the contact page .
                    </>
                  ),
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="mb-4"
                >
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                    {/* Accordion Header */}
                    <button
                      onClick={() => toggleFaqItem(index)}
                      className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 pr-4">
                        {item.question}
                      </h3>
                      <ChevronDownIcon
                        className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                          openFaqItems.has(index) ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Accordion Content */}
                    <motion.div
                      initial={false}
                      animate={{
                        height: openFaqItems.has(index) ? "auto" : 0,
                        opacity: openFaqItems.has(index) ? 1 : 0,
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-0">
                        <div className="text-gray-600 leading-relaxed">
                          {item.answer}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors font-medium"
              >
                <span>Still have questions? Contact us</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </LazyMotion>
  );
};

export default Home;
