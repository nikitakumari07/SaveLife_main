// LifeShare Frontend JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let userLocation = null;
    let bloodBanksMap = null;
    let organCentersMap = null;
    let nearestBanksMap = null;
    
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('accessToken') !== null;
    
    // Initialize the application
    initApp();
    
    // Initialize Leaflet maps when modals are shown
    document.getElementById('bloodBankDirectoryModal')?.addEventListener('shown.bs.modal', initBloodBankMap);
    document.getElementById('organDirectoryModal')?.addEventListener('shown.bs.modal', initOrganCenterMap);
    document.getElementById('nearestBankModal')?.addEventListener('shown.bs.modal', initNearestBankMap);
    
    // Event listeners for buttons and forms
    setupEventListeners();
    
    // Function to initialize the application
    function initApp() {
        updateAuthUI();
        loadDefaultData();
        
        // Try to get user's location if they allow it
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                },
                error => {
                    console.error("Geolocation error:", error);
                }
            );
        }
        
        // Initialize password toggles
        initPasswordToggles();
        
        // Initialize forms
        initForms();
    }
    
    // Function to update UI based on authentication status
    function updateAuthUI() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            if (isLoggedIn) {
                logoutBtn.style.display = 'block';
            } else {
                logoutBtn.style.display = 'none';
            }
        }
    }
    
    // Function to initialize password toggle functionality
    function initPasswordToggles() {
        document.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', function() {
                const input = this.closest('.input-group').querySelector('input');
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                this.querySelector('i').classList.toggle('fa-eye');
                this.querySelector('i').classList.toggle('fa-eye-slash');
            });
        });
    }
    
    // Function to initialize form handlers
    function initForms() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const rememberMe = document.getElementById('rememberMe').checked;
                
                // Simple validation
                if (!email || !password) {
                    showAlert('Please fill in all fields', 'danger');
                    return;
                }
                
                // Email validation regex
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    showAlert('Please enter a valid email address', 'danger');
                    return;
                }
                
                // Simulate login process
                simulateLogin(email, password, rememberMe);
            });
        }
        
        // Registration form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Get form values
                const firstName = document.getElementById('firstName').value.trim();
                const lastName = document.getElementById('lastName').value.trim();
                const email = document.getElementById('email').value.trim();
                const phone = document.getElementById('phone').value.trim();
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                const termsChecked = document.getElementById('termsCheck').checked;
                
                // Validate form
                if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
                    showAlert('Please fill in all required fields', 'danger');
                    return;
                }
                
                if (!termsChecked) {
                    showAlert('You must agree to the Terms of Service and Privacy Policy', 'danger');
                    return;
                }
                
                // Email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    showAlert('Please enter a valid email address', 'danger');
                    return;
                }
                
                // Phone validation (basic)
                const phoneRegex = /^[0-9]{10,15}$/;
                if (!phoneRegex.test(phone)) {
                    showAlert('Please enter a valid phone number (10-15 digits)', 'danger');
                    return;
                }
                
                // Password validation
                if (password.length < 8) {
                    showAlert('Password must be at least 8 characters', 'danger');
                    return;
                }
                
                if (password !== confirmPassword) {
                    showAlert('Passwords do not match', 'danger');
                    return;
                }
                
                // Simulate registration process
                simulateRegistration(firstName, lastName, email, phone, password);
            });
        }
    }
    
    // Function to load some default data
    function loadDefaultData() {
        // You might want to load some initial data here
    }
    
    // Function to set up all event listeners
    function setupEventListeners() {
        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', logout);
        
        // Blood availability check
        document.getElementById('checkBloodAvailability')?.addEventListener('click', checkBloodAvailability);
        
        // Blood bank search
        document.getElementById('searchBloodBanks')?.addEventListener('click', searchBloodBanks);
        
        // Organ availability check
        document.getElementById('checkOrganAvailability')?.addEventListener('click', checkOrganAvailability);
        
        // Organ center search
        document.getElementById('searchOrganCenters')?.addEventListener('click', searchOrganCenters);
        
        // Find nearest blood bank
        document.getElementById('findNearestBloodBank')?.addEventListener('click', findNearestBloodBanks);
        document.getElementById('findNearestBankBtn')?.addEventListener('click', findNearestBloodBanks);
        
        // Donation camp search
        document.getElementById('searchCamps')?.addEventListener('click', searchDonationCamps);
        
        // Newsletter subscription
        document.querySelector('footer form')?.addEventListener('submit', subscribeToNewsletter);
        
        // Donate Now buttons
        document.querySelectorAll('.btn-danger').forEach(btn => {
            if (btn.textContent.trim() === 'Donate Now') {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (!isLoggedIn) {
                        window.location.href = 'login.html';
                    } else {
                        // Redirect to donation page or show modal
                        alert('Redirecting to donation page...');
                    }
                });
            }
        });
        
        // Social login buttons
        document.querySelectorAll('.btn-google, .btn-facebook').forEach(button => {
            button.addEventListener('click', function() {
                const provider = this.classList.contains('btn-google') ? 'Google' : 'Facebook';
                showAlert(`Redirecting to ${provider} login...`, 'info');
            });
        });
    }
    
    // Function to initialize blood bank map
    function initBloodBankMap() {
        if (bloodBanksMap) return;
        
        bloodBanksMap = L.map('bloodBankMap').setView([20.5937, 78.9629], 5); // Default to India view
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(bloodBanksMap);
        
        // Load blood banks data
        fetch('/api/blood/banks')
            .then(response => response.json())
            .then(data => {
                data.forEach(bank => {
                    if (bank.latitude && bank.longitude) {
                        L.marker([bank.latitude, bank.longitude])
                            .addTo(bloodBanksMap)
                            .bindPopup(`<b>${bank.name}</b><br>${bank.address}`);
                    }
                });
                
                // Populate blood bank list
                const bankList = document.getElementById('bloodBankList');
                if (bankList) {
                    bankList.innerHTML = '';
                    data.forEach(bank => {
                        const item = document.createElement('a');
                        item.href = '#';
                        item.className = 'list-group-item list-group-item-action';
                        item.innerHTML = `
                            <div class="d-flex w-100 justify-content-between">
                                <h5 class="mb-1">${bank.name}</h5>
                                <small>${bank.distance || 'N/A'}</small>
                            </div>
                            <p class="mb-1">${bank.address}</p>
                            <small>${bank.phone}</small>
                        `;
                        item.addEventListener('click', function(e) {
                            e.preventDefault();
                            if (bank.latitude && bank.longitude) {
                                bloodBanksMap.setView([bank.latitude, bank.longitude], 15);
                            }
                        });
                        bankList.appendChild(item);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading blood banks:', error);
                const bankList = document.getElementById('bloodBankList');
                if (bankList) {
                    bankList.innerHTML = '<div class="alert alert-danger">Failed to load blood banks. Please try again later.</div>';
                }
            });
    }
    
    // Function to initialize organ center map
    function initOrganCenterMap() {
        if (organCentersMap) return;
        
        organCentersMap = L.map('organCenterMap').setView([20.5937, 78.9629], 5); // Default to India view
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(organCentersMap);
        
        // Load organ centers data
        fetch('/api/organ/hospitals')
            .then(response => response.json())
            .then(data => {
                data.forEach(hospital => {
                    if (hospital.latitude && hospital.longitude) {
                        L.marker([hospital.latitude, hospital.longitude])
                            .addTo(organCentersMap)
                            .bindPopup(`<b>${hospital.name}</b><br>${hospital.address}`);
                    }
                });
                
                // Populate organ center list
                const centerList = document.getElementById('organCenterList');
                if (centerList) {
                    centerList.innerHTML = '';
                    data.forEach(hospital => {
                        const item = document.createElement('a');
                        item.href = '#';
                        item.className = 'list-group-item list-group-item-action';
                        item.innerHTML = `
                            <div class="d-flex w-100 justify-content-between">
                                <h5 class="mb-1">${hospital.name}</h5>
                                <small>Transplant Center</small>
                            </div>
                            <p class="mb-1">${hospital.address}</p>
                            <small>Specialties: ${hospital.specialties}</small>
                        `;
                        item.addEventListener('click', function(e) {
                            e.preventDefault();
                            if (hospital.latitude && hospital.longitude) {
                                organCentersMap.setView([hospital.latitude, hospital.longitude], 15);
                            }
                        });
                        centerList.appendChild(item);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading organ centers:', error);
                const centerList = document.getElementById('organCenterList');
                if (centerList) {
                    centerList.innerHTML = '<div class="alert alert-danger">Failed to load transplant centers. Please try again later.</div>';
                }
            });
    }
    
    // Function to initialize nearest bank map
    function initNearestBankMap() {
        if (nearestBanksMap) return;
        
        nearestBanksMap = L.map('nearestBankMap').setView([20.5937, 78.9629], 13); // Default to India view
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(nearestBanksMap);
        
        // Add user location if available
        if (userLocation) {
            L.marker([userLocation.lat, userLocation.lng])
                .addTo(nearestBanksMap)
                .bindPopup('<b>Your Location</b>')
                .openPopup();
            
            nearestBanksMap.setView([userLocation.lat, userLocation.lng], 13);
        }
    }
    
    // Function to check blood availability
    function checkBloodAvailability() {
        const bloodType = document.getElementById('bloodTypeSelect').value;
        const location = document.getElementById('bloodLocation').value;
        
        showLoading('#bloodAvailabilityTable tbody');
        
        // Mock data - in a real app, this would come from an API
        const mockData = [
            {
                blood_bank: 'City Central Blood Bank',
                distance: '2.5 miles',
                units_available: bloodType === 'O-' ? 2 : 10,
                last_updated: '2 hours ago',
                address: '123 Medical Way, ' + location,
                phone: '(555) 123-4567'
            },
            {
                blood_bank: 'Regional Blood Center',
                distance: '5.1 miles',
                units_available: bloodType === 'B+' ? 1 : 8,
                last_updated: '1 hour ago',
                address: '456 Health Ave, ' + location,
                phone: '(555) 987-6543'
            },
            {
                blood_bank: 'Community Blood Services',
                distance: '7.8 miles',
                units_available: 15,
                last_updated: '30 minutes ago',
                address: '789 Donor Blvd, ' + location,
                phone: '(555) 456-7890'
            }
        ];
        
        const tableBody = document.querySelector('#bloodAvailabilityTable tbody');
        if (tableBody) {
            tableBody.innerHTML = '';
            
            if (mockData.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center py-4">No blood banks found with the specified criteria.</td>
                    </tr>
                `;
                return;
            }
            
            mockData.forEach(bank => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${bank.blood_bank}</td>
                    <td>${bank.distance}</td>
                    <td>${bank.units_available} units</td>
                    <td>${bank.last_updated}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger contact-btn" data-bank='${JSON.stringify(bank)}'>Contact</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // Add event listeners to contact buttons
            document.querySelectorAll('.contact-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const bank = JSON.parse(this.getAttribute('data-bank'));
                    alert(`Contact ${bank.blood_bank} at ${bank.phone} or visit at ${bank.address}`);
                });
            });
        }
    }
    
    // Function to search blood banks
    function searchBloodBanks() {
        const searchTerm = document.getElementById('bloodBankSearch').value;
        
        // Mock data - in a real app, this would come from an API
        const mockBanks = [
            {
                id: 1,
                name: 'City Central Blood Bank',
                address: '123 Medical Way, City',
                phone: '(555) 123-4567',
                hours: 'Mon-Fri: 8am-6pm, Sat: 9am-4pm',
                lat: 40.7128,
                lng: -74.0060
            },
            {
                id: 2,
                name: 'Regional Blood Center',
                address: '456 Health Ave, City',
                phone: '(555) 987-6543',
                hours: 'Mon-Sun: 7am-8pm',
                lat: 40.7218,
                lng: -74.0160
            },
            {
                id: 3,
                name: 'Community Blood Services',
                address: '789 Donor Blvd, City',
                phone: '(555) 456-7890',
                hours: 'Mon-Fri: 9am-5pm',
                lat: 40.7028,
                lng: -74.0260
            }
        ];
        
        // Filter if search term is provided
        const filteredBanks = searchTerm 
            ? mockBanks.filter(bank => 
                bank.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                bank.address.toLowerCase().includes(searchTerm.toLowerCase()))
            : mockBanks;
        
        const bankList = document.getElementById('bloodBankList');
        if (bankList) {
            bankList.innerHTML = '';
            
            filteredBanks.forEach(bank => {
                const bankItem = document.createElement('a');
                bankItem.href = '#';
                bankItem.className = 'list-group-item list-group-item-action blood-bank-item';
                bankItem.innerHTML = `
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">${bank.name}</h5>
                        <small>${getRandomDistance()} miles</small>
                    </div>
                    <p class="mb-1">${bank.address}</p>
                    <small>${bank.hours}</small>
                `;
                bankItem.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (bank.lat && bank.lng) {
                        bloodBanksMap.setView([bank.lat, bank.lng], 15);
                    }
                });
                bankList.appendChild(bankItem);
            });
        }
    }
    
    // Function to check organ availability
    function checkOrganAvailability() {
        const organType = document.getElementById('organTypeSelect').value;
        const location = document.getElementById('organLocation').value;
        
        showLoading('#organAvailabilityTable tbody');
        
        // Mock data - in a real app, this would come from an API
        const mockData = [
            {
                hospital: 'City General Hospital',
                patients_waiting: organType === 'kidney' ? 42 : 15,
                avg_wait_time_days: organType === 'kidney' ? '3-5 years' : '1-2 years',
                last_transplant_date: organType === 'kidney' ? '2 weeks ago' : '1 month ago',
                address: '123 Medical Way, ' + location,
                phone: '(555) 123-4567'
            },
            {
                hospital: 'Regional Transplant Center',
                patients_waiting: organType === 'heart' ? 28 : 19,
                avg_wait_time_days: organType === 'heart' ? '6-12 months' : '2-3 years',
                last_transplant_date: organType === 'heart' ? '5 days ago' : '2 weeks ago',
                address: '456 Health Ave, ' + location,
                phone: '(555) 987-6543'
            },
            {
                hospital: 'University Medical Center',
                patients_waiting: organType === 'liver' ? 35 : 22,
                avg_wait_time_days: organType === 'liver' ? '1-2 years' : '3-5 years',
                last_transplant_date: organType === 'liver' ? '3 days ago' : '1 month ago',
                address: '789 Donor Blvd, ' + location,
                phone: '(555) 456-7890'
            }
        ];
        
        const tableBody = document.querySelector('#organAvailabilityTable tbody');
        if (tableBody) {
            tableBody.innerHTML = '';
            
            if (mockData.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center py-4">No hospitals found with the specified criteria.</td>
                    </tr>
                `;
                return;
            }
            
            mockData.forEach(hospital => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${hospital.hospital}</td>
                    <td>${hospital.patients_waiting}</td>
                    <td>${hospital.avg_wait_time_days}</td>
                    <td>${hospital.last_transplant_date || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger contact-btn" data-center='${JSON.stringify(hospital)}'>Contact</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // Add event listeners to contact buttons
            document.querySelectorAll('.contact-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const center = JSON.parse(this.getAttribute('data-center'));
                    alert(`Contact ${center.hospital} at ${center.phone} or visit at ${center.address}`);
                });
            });
        }
    }
    
    // Function to search organ centers
    function searchOrganCenters() {
        const searchTerm = document.getElementById('organCenterSearch').value;
        
        // Mock data - in a real app, this would come from an API
        const mockCenters = [
            {
                id: 1,
                name: 'City General Transplant Center',
                address: '123 Medical Way, City',
                phone: '(555) 123-4567',
                specialties: 'Heart, Kidney, Liver',
                lat: 40.7128,
                lng: -74.0060
            },
            {
                id: 2,
                name: 'Regional Organ Institute',
                address: '456 Health Ave, City',
                phone: '(555) 987-6543',
                specialties: 'Kidney, Pancreas, Cornea',
                lat: 40.7218,
                lng: -74.0160
            },
            {
                id: 3,
                name: 'University Medical Transplant',
                address: '789 Donor Blvd, City',
                phone: '(555) 456-7890',
                specialties: 'Heart, Lung, Liver, Intestine',
                lat: 40.7028,
                lng: -74.0260
            }
        ];
        
        // Filter if search term is provided
        const filteredCenters = searchTerm 
            ? mockCenters.filter(center => 
                center.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                center.address.toLowerCase().includes(searchTerm.toLowerCase()))
            : mockCenters;
        
        const centerList = document.getElementById('organCenterList');
        if (centerList) {
            centerList.innerHTML = '';
            
            filteredCenters.forEach(center => {
                const centerItem = document.createElement('a');
                centerItem.href = '#';
                centerItem.className = 'list-group-item list-group-item-action organ-center-item';
                centerItem.innerHTML = `
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">${center.name}</h5>
                        <small>${getRandomDistance()} miles</small>
                    </div>
                    <p class="mb-1">${center.address}</p>
                    <small>Specialties: ${center.specialties}</small>
                `;
                centerItem.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (center.lat && center.lng) {
                        organCentersMap.setView([center.lat, center.lng], 15);
                    }
                });
                centerList.appendChild(centerItem);
            });
        }
    }
    
    // Function to find nearest blood banks
    function findNearestBloodBanks(e) {
        if (e) e.preventDefault();
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('nearestBankModal'));
        modal.show();
        
        // If we already have the user's location, use it
        if (userLocation) {
            loadNearestBanks(userLocation);
        } 
        // Otherwise try to get it again
        else if (navigator.geolocation) {
            const resultsDiv = document.getElementById('nearestBankResults');
            if (resultsDiv) {
                resultsDiv.innerHTML = `
                    <div class="text-center py-3">
                        <div class="spinner-border text-danger" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p>Getting your location...</p>
                    </div>
                `;
            }
            
            navigator.geolocation.getCurrentPosition(
                position => {
                    userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    loadNearestBanks(userLocation);
                },
                error => {
                    console.error("Geolocation error:", error);
                    const resultsDiv = document.getElementById('nearestBankResults');
                    if (resultsDiv) {
                        resultsDiv.innerHTML = `
                            <div class="alert alert-danger">
                                Could not determine your location. Please enable location services or search manually.
                            </div>
                        `;
                    }
                }
            );
        } 
        // No geolocation support
        else {
            const resultsDiv = document.getElementById('nearestBankResults');
            if (resultsDiv) {
                resultsDiv.innerHTML = `
                    <div class="alert alert-warning">
                        Your browser does not support geolocation. Please search manually.
                    </div>
                `;
            }
        }
    }
    
    // Function to load nearest blood banks
    function loadNearestBanks(location) {
        showLoading('#nearestBankResults');
        
        // Mock data - in a real app, this would come from an API
        const mockBanks = [
            {
                name: 'City Central Blood Bank',
                distance: '0.8 miles',
                address: '123 Medical Way, City',
                phone: '(555) 123-4567',
                hours: 'Mon-Fri: 8am-6pm, Sat: 9am-4pm',
                lat: 40.7128,
                lng: -74.0060
            },
            {
                name: 'Downtown Blood Center',
                distance: '1.2 miles',
                address: '100 Main St, City',
                phone: '(555) 111-2222',
                hours: 'Mon-Sun: 7am-9pm',
                lat: 40.7188,
                lng: -74.0080
            },
            {
                name: 'Community Blood Services',
                distance: '2.1 miles',
                address: '789 Donor Blvd, City',
                phone: '(555) 456-7890',
                hours: 'Mon-Fri: 9am-5pm',
                lat: 40.7028,
                lng: -74.0260
            }
        ];
        
        const resultsDiv = document.getElementById('nearestBankResults');
        if (resultsDiv) {
            resultsDiv.innerHTML = '';
            
            if (mockBanks.length === 0) {
                resultsDiv.innerHTML = `
                    <div class="alert alert-info">
                        No blood banks found near your location.
                    </div>
                `;
                return;
            }
            
            // Add markers to map
            mockBanks.forEach(bank => {
                if (bank.lat && bank.lng) {
                    L.marker([bank.lat, bank.lng])
                        .addTo(nearestBanksMap)
                        .bindPopup(`<b>${bank.name}</b><br>${bank.address}`);
                }
            });
            
            // Create list of results
            const listGroup = document.createElement('div');
            listGroup.className = 'list-group';
            
            mockBanks.forEach(bank => {
                const item = document.createElement('a');
                item.href = '#';
                item.className = 'list-group-item list-group-item-action';
                item.innerHTML = `
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">${bank.name}</h5>
                        <small>${bank.distance}</small>
                    </div>
                    <p class="mb-1">${bank.address}</p>
                    <small>Phone: ${bank.phone}</small>
                `;
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (bank.lat && bank.lng) {
                        nearestBanksMap.setView([bank.lat, bank.lng], 15);
                    }
                });
                listGroup.appendChild(item);
            });
            
            resultsDiv.appendChild(listGroup);
        }
    }
    
    // Function to search donation camps
    function searchDonationCamps() {
        const location = document.getElementById('campLocationSearch').value;
        
        showLoading('#campList');
        
        // Mock data - in a real app, this would come from an API
        const mockCamps = [
            {
                id: 1,
                name: 'Community Blood Drive',
                start_date: 'Next Saturday, 10am',
                end_date: 'Next Saturday, 4pm',
                address: 'City Community Center, 123 Main St, ' + location,
                organizer: 'City Blood Services',
                contact_phone: '(555) 123-4567',
                contact_email: 'info@cityblood.org',
                description: 'Join us for our monthly community blood drive. All donors will receive a free t-shirt and refreshments.'
            },
            {
                id: 2,
                name: 'Emergency Blood Donation Camp',
                start_date: 'Tomorrow, 8am',
                end_date: 'Tomorrow, 6pm',
                address: 'Regional Hospital, 456 Health Ave, ' + location,
                organizer: 'Regional Blood Network',
                contact_phone: '(555) 987-6543',
                contact_email: 'donate@regionalblood.org',
                description: 'Emergency blood donation camp to replenish critically low blood supplies.'
            },
            {
                id: 3,
                name: 'Corporate Blood Donation Event',
                start_date: 'Friday, 9am',
                end_date: 'Friday, 3pm',
                address: 'Tech Park, 789 Innovation Blvd, ' + location,
                organizer: 'LifeShare Partners',
                contact_phone: '(555) 456-7890',
                contact_email: 'events@lifeshare.org',
                description: 'Corporate blood donation event open to all employees and the public.'
            }
        ];
        
        // Filter if location is provided
        const filteredCamps = location 
            ? mockCamps.filter(camp => 
                camp.address.toLowerCase().includes(location.toLowerCase()))
            : mockCamps;
        
        const campList = document.getElementById('campList');
        if (campList) {
            campList.innerHTML = '';
            
            if (filteredCamps.length === 0) {
                campList.innerHTML = `
                    <div class="alert alert-info">
                        No upcoming donation camps found in the specified location.
                    </div>
                `;
                return;
            }
            
            filteredCamps.forEach(camp => {
                const item = document.createElement('a');
                item.href = '#';
                item.className = 'list-group-item list-group-item-action camp-card mb-2';
                item.innerHTML = `
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1 text-danger">${camp.name}</h5>
                        <small>${getRandomDistance()} miles away</small>
                    </div>
                    <p class="mb-1"><strong>When:</strong> ${camp.start_date} to ${camp.end_date}</p>
                    <p class="mb-1"><strong>Where:</strong> ${camp.address}</p>
                    <small class="text-muted">Organized by ${camp.organizer}</small>
                    <p class="mt-2">${camp.description}</p>
                `;
                campList.appendChild(item);
            });
        }
    }
    
    // Function to subscribe to newsletter
    function subscribeToNewsletter(e) {
        e.preventDefault();
        const emailInput = e.target.querySelector('input[type="email"]');
        const email = emailInput.value;
        
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAlert('Please enter a valid email address', 'danger');
            return;
        }
        
        // In a real app, you would send this to your backend
        console.log('Subscribing email:', email);
        
        // Show success message
        const form = e.target;
        form.innerHTML = `
            <div class="alert alert-success">
                Thank you for subscribing to our newsletter!
            </div>
        `;
        
        // Reset form after 3 seconds
        setTimeout(() => {
            form.innerHTML = `
                <div class="input-group">
                    <input type="email" class="form-control" placeholder="Your email">
                    <button class="btn btn-danger" type="submit">Subscribe</button>
                </div>
            `;
        }, 3000);
    }
    
    // Function to simulate login process
    function simulateLogin(email, password, rememberMe) {
        showAlert('Logging in...', 'info');
        
        // Simulate API call delay
        setTimeout(() => {
            // This is just a simulation - in a real app you would check credentials against a database
            if (password.length >= 8) {
                showAlert('Login successful! Redirecting to dashboard...', 'success');
                
                // Store authentication token
                localStorage.setItem('accessToken', 'simulated-token');
                
                // Redirect to home page
                window.location.href = 'home.html';
            } else {
                showAlert('Invalid credentials. Please try again.', 'danger');
            }
        }, 1500);
    }
    
    // Function to simulate registration process
    function simulateRegistration(firstName, lastName, email, phone, password) {
        showAlert('Creating your account...', 'info');
        
        // Simulate API call delay
        setTimeout(() => {
            showAlert('Registration successful! Welcome to our donor community.', 'success');
            
            // Store authentication token
            localStorage.setItem('accessToken', 'simulated-token');
            
            // Redirect to home page
            window.location.href = 'home.html';
        }, 2000);
    }
    
    // Function to show loading state
    function showLoading(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <div class="spinner-border text-danger" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2">Loading data...</p>
                    </td>
                </tr>
            `;
        }
    }
    
    // Function to show alert message
    function showAlert(message, type) {
        // Remove any existing alerts
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `custom-alert alert alert-${type} alert-dismissible fade show`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Position the alert
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
        alertDiv.style.maxWidth = '400px';
        
        document.body.appendChild(alertDiv);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alertDiv);
            bsAlert.close();
        }, 5000);
    }
    
    // Function to handle logout
    function logout() {
        // Clear authentication tokens
        localStorage.removeItem('accessToken');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
    
    // Helper function to get random distance
    function getRandomDistance() {
        const distances = [0.5, 1.2, 1.8, 2.3, 2.7, 3.1, 3.5, 4.0, 4.5, 5.2];
        return distances[Math.floor(Math.random() * distances.length)];
    }
    
    // Make logout function available globally
    window.logout = logout;
});