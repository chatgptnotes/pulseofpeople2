import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Search } from 'lucide-react';
import { djangoApi } from '../services/djangoApi';

interface District {
  id: number;
  name: string;
  code: string;
}

interface Constituency {
  id: number;
  name: string;
  code: string;
  district_name: string;
}

interface PollingBooth {
  id: number;
  booth_number: string;
  name: string;
  area: string;
  constituency_name: string;
  total_voters: number;
}

interface CascadingLocationDropdownProps {
  selectedDistrict: string;
  selectedConstituency: string;
  selectedPollingBooth?: string;
  onDistrictChange: (district: string) => void;
  onConstituencyChange: (constituency: string) => void;
  onPollingBoothChange?: (booth: string) => void;
  required?: boolean;
  showPollingBooth?: boolean;  // Control whether to show polling booth dropdown
  userRole?: string;  // Used to conditionally show polling booth for 'user' or 'volunteer' roles
}

const CascadingLocationDropdown: React.FC<CascadingLocationDropdownProps> = ({
  selectedDistrict,
  selectedConstituency,
  selectedPollingBooth = '',
  onDistrictChange,
  onConstituencyChange,
  onPollingBoothChange,
  required = false,
  showPollingBooth = false,
  userRole = '',
}) => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [filteredConstituencies, setFilteredConstituencies] = useState<Constituency[]>([]);
  const [pollingBooths, setPollingBooths] = useState<PollingBooth[]>([]);
  const [filteredPollingBooths, setFilteredPollingBooths] = useState<PollingBooth[]>([]);

  const [districtSearch, setDistrictSearch] = useState('');
  const [constituencySearch, setConstituencySearch] = useState('');
  const [boothSearch, setBoothSearch] = useState('');

  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showConstituencyDropdown, setShowConstituencyDropdown] = useState(false);
  const [showBoothDropdown, setShowBoothDropdown] = useState(false);
  const [dropdownDirection, setDropdownDirection] = useState<'down' | 'up'>('up');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if polling booth should be shown (based on role or showPollingBooth prop)
  const shouldShowPollingBooth = showPollingBooth || userRole === 'user' || userRole === 'volunteer';

  // Fetch districts on component mount
  useEffect(() => {
    const fetchDistricts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await djangoApi.getDistricts();
        // API returns array directly (no pagination)
        const data = Array.isArray(response) ? response : (response.results || []);
        setDistricts(data);
      } catch (err) {
        console.error('Error fetching districts:', err);
        setError('Failed to load districts. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
  }, []);

  // Fetch all constituencies on component mount
  useEffect(() => {
    const fetchConstituencies = async () => {
      try {
        const response = await djangoApi.getConstituencies();
        // API returns array directly (no pagination)
        const data = Array.isArray(response) ? response : (response.results || []);
        setConstituencies(data);
      } catch (err) {
        console.error('Error fetching constituencies:', err);
      }
    };

    fetchConstituencies();
  }, []);

  // Fetch all polling booths on component mount (only if needed)
  useEffect(() => {
    if (!shouldShowPollingBooth) return;

    const fetchPollingBooths = async () => {
      try {
        const response = await djangoApi.getPollingBooths();
        // API returns array directly (no pagination)
        const data = Array.isArray(response) ? response : (response.results || []);
        setPollingBooths(data);
      } catch (err) {
        console.error('Error fetching polling booths:', err);
      }
    };

    fetchPollingBooths();
  }, [shouldShowPollingBooth]);

  // Filter constituencies when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const filtered = constituencies.filter(c => c.district_name === selectedDistrict);
      setFilteredConstituencies(filtered);

      // Reset constituency if it's not in the filtered list
      if (selectedConstituency && !filtered.find(c => c.name === selectedConstituency)) {
        onConstituencyChange('');
      }
    } else {
      setFilteredConstituencies([]);
      onConstituencyChange('');
    }
  }, [selectedDistrict, constituencies]);

  // Filter polling booths when constituency changes
  useEffect(() => {
    if (!shouldShowPollingBooth) return;

    if (selectedConstituency) {
      const filtered = pollingBooths.filter(b => b.constituency_name === selectedConstituency);
      setFilteredPollingBooths(filtered);

      // Reset booth if it's not in the filtered list
      if (selectedPollingBooth && !filtered.find(b => b.name === selectedPollingBooth)) {
        onPollingBoothChange?.('');
      }
    } else {
      setFilteredPollingBooths([]);
      onPollingBoothChange?.('');
    }
  }, [selectedConstituency, pollingBooths, shouldShowPollingBooth]);

  // Filter districts based on search
  const filteredDistricts = districts.filter(district =>
    district.name.toLowerCase().includes(districtSearch.toLowerCase())
  );

  // Filter constituencies based on search
  const searchedConstituencies = filteredConstituencies.filter(constituency =>
    constituency.name.toLowerCase().includes(constituencySearch.toLowerCase())
  );

  // Filter polling booths based on search
  const searchedPollingBooths = filteredPollingBooths.filter(booth =>
    booth.name.toLowerCase().includes(boothSearch.toLowerCase()) ||
    booth.booth_number.toLowerCase().includes(boothSearch.toLowerCase()) ||
    booth.area.toLowerCase().includes(boothSearch.toLowerCase())
  );

  const handleDistrictSelect = (districtName: string) => {
    onDistrictChange(districtName);
    setShowDistrictDropdown(false);
    setDistrictSearch('');
  };

  const handleConstituencySelect = (constituencyName: string) => {
    onConstituencyChange(constituencyName);
    setShowConstituencyDropdown(false);
    setConstituencySearch('');
  };

  const handlePollingBoothSelect = (boothName: string) => {
    onPollingBoothChange?.(boothName);
    setShowBoothDropdown(false);
    setBoothSearch('');
  };

  return (
    <div className={`grid grid-cols-1 gap-4 ${shouldShowPollingBooth ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
      {/* District Dropdown */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          District {required && <span className="text-red-500">*</span>}
        </label>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDistrictDropdown(!showDistrictDropdown)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between ${
              selectedDistrict ? 'border-gray-300 bg-white' : 'border-gray-300 bg-gray-50'
            }`}
            disabled={loading}
          >
            <span className={selectedDistrict ? 'text-gray-900' : 'text-gray-400'}>
              {selectedDistrict || 'Select District'}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showDistrictDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDistrictDropdown && (
            <div className={`absolute z-[60] w-full bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden max-h-[240px] flex flex-col ${
              dropdownDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
            }`}>
              {/* Search Input */}
              <div className="p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search districts..."
                    value={districtSearch}
                    onChange={(e) => setDistrictSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                </div>
              </div>

              {/* District List - Shows max 5 items at a time */}
              <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 flex-1">
                {filteredDistricts.length > 0 ? (
                  filteredDistricts.map((district) => (
                    <button
                      key={district.id}
                      type="button"
                      onClick={() => handleDistrictSelect(district.name)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                        selectedDistrict === district.name ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      {district.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    No districts found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* Constituency Dropdown */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Constituency {required && <span className="text-red-500">*</span>}
        </label>

        <div className="relative">
          <button
            type="button"
            onClick={() => selectedDistrict && setShowConstituencyDropdown(!showConstituencyDropdown)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between ${
              !selectedDistrict
                ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
                : selectedConstituency
                ? 'border-gray-300 bg-white'
                : 'border-gray-300 bg-gray-50'
            }`}
            disabled={!selectedDistrict}
          >
            <span className={selectedConstituency ? 'text-gray-900' : 'text-gray-400'}>
              {selectedConstituency || (selectedDistrict ? 'Select Constituency' : 'Select district first')}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showConstituencyDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showConstituencyDropdown && selectedDistrict && (
            <div className={`absolute z-[60] w-full bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden max-h-[240px] flex flex-col ${
              dropdownDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
            }`}>
              {/* Search Input */}
              <div className="p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search constituencies..."
                    value={constituencySearch}
                    onChange={(e) => setConstituencySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                </div>
              </div>

              {/* Constituency List - Shows max 5 items at a time */}
              <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 flex-1">
                {searchedConstituencies.length > 0 ? (
                  searchedConstituencies.map((constituency) => (
                    <button
                      key={constituency.id}
                      type="button"
                      onClick={() => handleConstituencySelect(constituency.name)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                        selectedConstituency === constituency.name ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      {constituency.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    {filteredConstituencies.length === 0
                      ? 'No constituencies in this district'
                      : 'No constituencies found'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {selectedDistrict && filteredConstituencies.length > 0 && (
          <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {filteredConstituencies.length} constituencies in {selectedDistrict}
          </p>
        )}
      </div>

      {/* Polling Booth Dropdown - Conditionally shown for user/volunteer roles */}
      {shouldShowPollingBooth && (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Polling Booth {required && <span className="text-red-500">*</span>}
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={() => selectedConstituency && setShowBoothDropdown(!showBoothDropdown)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between ${
                !selectedConstituency
                  ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
                  : selectedPollingBooth
                  ? 'border-gray-300 bg-white'
                  : 'border-gray-300 bg-gray-50'
              }`}
              disabled={!selectedConstituency}
            >
              <span className={selectedPollingBooth ? 'text-gray-900' : 'text-gray-400'}>
                {selectedPollingBooth || (selectedConstituency ? 'Select Polling Booth' : 'Select constituency first')}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showBoothDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showBoothDropdown && selectedConstituency && (
              <div className={`absolute z-[60] w-full bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden max-h-[240px] flex flex-col ${
                dropdownDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
              }`}>
                {/* Search Input */}
                <div className="p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search booths..."
                      value={boothSearch}
                      onChange={(e) => setBoothSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Polling Booth List - Shows max 5 items at a time */}
                <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 flex-1">
                  {searchedPollingBooths.length > 0 ? (
                    searchedPollingBooths.map((booth) => (
                      <button
                        key={booth.id}
                        type="button"
                        onClick={() => handlePollingBoothSelect(booth.name)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          selectedPollingBooth === booth.name ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{booth.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{booth.area}</div>
                          </div>
                          <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                            #{booth.booth_number}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                      {filteredPollingBooths.length === 0
                        ? 'No polling booths in this constituency'
                        : 'No booths found'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {selectedConstituency && filteredPollingBooths.length > 0 && (
            <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {filteredPollingBooths.length} polling booths in {selectedConstituency}
            </p>
          )}
        </div>
      )}

      {/* Click outside handler */}
      {(showDistrictDropdown || showConstituencyDropdown || showBoothDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowDistrictDropdown(false);
            setShowConstituencyDropdown(false);
            setShowBoothDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default CascadingLocationDropdown;
