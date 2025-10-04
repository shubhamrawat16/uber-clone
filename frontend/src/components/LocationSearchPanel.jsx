import React from 'react';

const LocationSearchPanel = ({ suggestions, setPanelOpen, setPickup, setDestination, activeField }) => {
    
    const handleSelect = (place) => {
        if (activeField === 'pickup') {
            setPickup(place.description);
            setActiveField('destination');
        } else {
            setDestination(place.description);
        }
        if (pickup && destination) {
            setPanelOpen(false);
        }
    };

    return (
        <div className="p-4">
            {Array.isArray(suggestions) && suggestions.length > 0 ? (
                suggestions.map((place, idx) => (
                    <div
                        key={idx}
                        className="py-2 border-b cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSelect(place)}
                    >
                        {place.description}
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No suggestions</p>
            )}
        </div>
    );
};

export default LocationSearchPanel;
