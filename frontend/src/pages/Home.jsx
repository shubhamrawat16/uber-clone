import React, { useEffect, useRef, useState, useContext } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import axios from 'axios';
import 'remixicon/fonts/remixicon.css';
import LocationSearchPanel from '../components/LocationSearchPanel';
import VehiclePanel from '../components/VehiclePanel';
import ConfirmRide from '../components/ConfirmRide';
import LookingForDriver from '../components/LookingForDriver';
import WaitingForDriver from '../components/WaitingForDriver';
import { SocketContext } from '../context/SocketContext';
import { UserDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import LiveTracking from '../components/LiveTracking';

const Home = () => {
    const [pickup, setPickup] = useState("");
    const [destination, setDestination] = useState("");
    const [panelOpen, setPanelOpen] = useState(false);
    const vehiclePanelRef = useRef(null);
    const confirmRidePanelRef = useRef(null);
    const vehicleFoundRef = useRef(null);
    const waitingForDriverRef = useRef(null);
    const panelRef = useRef(null);
    const panelCloseRef = useRef(null);
    const [vehiclePanel, setVehiclePanel] = useState(false);
    const [confirmRidePanel, setConfirmRidePanel] = useState(false);
    const [vehicleFound, setVehicleFound] = useState(false);
    const [waitingForDriver, setWaitingForDriver] = useState(false);
    const [pickupSuggestions, setPickupSuggestions] = useState(null);
    const [destinationSuggestions, setDestinationSuggestions] = useState(null);
    const [activeField, setActiveField] = useState(null);
    const [fare, setFare] = useState({});
    const [vehicleType, setVehicleType] = useState(null);
    const [ride, setRide] = useState(null);

    const navigate = useNavigate();
    const { socket } = useContext(SocketContext);
    const { user } = useContext(UserDataContext);

    useEffect(() => {
        socket.emit("join", { userType: "user", userId: user._id });
    }, [user]);

    socket.on('ride-confirmed', ride => {
        setVehicleFound(false);
        setWaitingForDriver(true);
        setRide(ride);
    });

    socket.on('ride-started', ride => {
        setWaitingForDriver(false);
        navigate('/riding', { state: { ride } });
    });

    const handlePickupChange = async (e) => {
    const value = e.target.value;
    setPickup(value);

    if (value.length < 2) {
        setPickupSuggestions([]);
        return;
    }

    try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
            params: { input: value },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        setPickupSuggestions(response.data || []);
    } catch (error) {
        console.error('Pickup suggestions error:', error);
        setPickupSuggestions([]);
    }
};

const handleDestinationChange = async (e) => {
    const value = e.target.value;
    setDestination(value);

    if (value.length < 2) {
        setDestinationSuggestions([]);
        return;
    }

    try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
            params: { input: value },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        setDestinationSuggestions(response.data || []);
    } catch (error) {
        console.error('Destination suggestions error:', error);
        setDestinationSuggestions([]);
    }
};


    const submitHandler = (e) => e.preventDefault();

    useGSAP(function () {
        if (panelOpen) {
            gsap.to(panelRef.current, {
                height: '70%',
                padding: 24
                // opacity:1
            })
            gsap.to(panelCloseRef.current, {
                opacity: 1
            })
        } else {
            gsap.to(panelRef.current, {
                height: '0%',
                padding: 0
                // opacity:0
            })
            gsap.to(panelCloseRef.current, {
                opacity: 0
            })
        }
    }, [ panelOpen ])


    useGSAP(() => {
        gsap.to(vehiclePanelRef.current, { transform: vehiclePanel ? 'translateY(0)' : 'translateY(100%)' });
    }, [vehiclePanel]);

    useGSAP(() => {
        gsap.to(confirmRidePanelRef.current, { transform: confirmRidePanel ? 'translateY(0)' : 'translateY(100%)' });
    }, [confirmRidePanel]);

    useGSAP(() => {
        gsap.to(vehicleFoundRef.current, { transform: vehicleFound ? 'translateY(0)' : 'translateY(100%)' });
    }, [vehicleFound]);

    useGSAP(() => {
        gsap.to(waitingForDriverRef.current, { transform: waitingForDriver ? 'translateY(0)' : 'translateY(100%)' });
    }, [waitingForDriver]);

    async function findTrip() {
    if (!pickup || !destination) {
        alert("Select pickup and destination first");
        return;
    }
    setVehiclePanel(true);
    setPanelOpen(false);
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`, {
        params: {
            pickup,
            destination
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setFare(response.data);
}


    async function createRide() {
        if (!vehicleType) {
            console.warn("Vehicle type missing, proceeding anyway");
        }
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/create`, {
            pickup,
            destination,
            vehicleType
        }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        console.log("Ride created:", response.data);
    }

    return (
        <div className='h-screen relative overflow-hidden'>
            <img className='w-16 absolute left-5 top-5' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
            <div className='relative w-full h-[60%] z-0'>
                <LiveTracking />
            </div>
            <div className='absolute bottom-0 w-full'>
                <div className='h-[30%] p-6 bg-white relative'>
                    <h5 ref={panelCloseRef} onClick={() => setPanelOpen(false)} className='absolute opacity-0 right-6 top-6 text-2xl'>
                        <i className="ri-arrow-down-wide-line"></i>
                    </h5>
                    <h4 className='text-2xl font-semibold'>Find a trip</h4>
                    <form className='relative py-3' onSubmit={submitHandler}>
                        <div className="line absolute h-16 w-1 top-[50%] -translate-y-1/2 left-5 bg-gray-700 rounded-full"></div>
                        <input 
                            value={pickup}
                            onChange={handlePickupChange}
                            onClick={() => {
                                setActiveField('pickup');
                                setPanelOpen(true); // open panel when clicking pickup
                            }}
                            placeholder='Add a pick-up location'
                            className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full'
                        />

                        <input
                            value={destination}
                            onChange={handleDestinationChange}
                            onClick={() => {
                                setActiveField('destination');
                                setPanelOpen(true); // open panel when clicking destination
                            }}
                            placeholder='Enter your destination'
                            className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3'
                        />
                    </form>
                    <button onClick={findTrip} className='bg-black text-white px-4 py-2 rounded-lg mt-3 w-full'>
                        Find Trip
                    </button>
                </div>
                <div ref={panelRef} className='bg-white h-0'>
                    <LocationSearchPanel
                        suggestions={activeField === 'pickup' ? pickupSuggestions || [] : destinationSuggestions || []}
                        setPanelOpen={setPanelOpen}
                        setVehiclePanel={setVehiclePanel}
                        setPickup={setPickup}
                        setDestination={setDestination}
                        activeField={activeField}
                    />
                </div>
            </div>

            <div ref={vehiclePanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                <VehiclePanel selectVehicle={setVehicleType} fare={fare} setConfirmRidePanel={setConfirmRidePanel} setVehiclePanel={setVehiclePanel} />
            </div>
            <div ref={confirmRidePanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'>
                <ConfirmRide createRide={createRide} pickup={pickup} destination={destination} fare={fare} vehicleType={vehicleType}
                    setConfirmRidePanel={setConfirmRidePanel} setVehicleFound={setVehicleFound} />
            </div>
            <div ref={vehicleFoundRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'>
                <LookingForDriver createRide={createRide} pickup={pickup} destination={destination} fare={fare} vehicleType={vehicleType}
                    setVehicleFound={setVehicleFound} />
            </div>
            <div ref={waitingForDriverRef} className='fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12'>
                <WaitingForDriver ride={ride} setVehicleFound={setVehicleFound} setWaitingForDriver={setWaitingForDriver} waitingForDriver={waitingForDriver} />
            </div>
        </div>
    );
};

export default Home;
