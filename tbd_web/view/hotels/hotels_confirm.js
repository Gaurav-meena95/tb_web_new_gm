// Hotel Confirmation Page JavaScript
class HotelConfirmation {
    constructor() {
        this.bookingData = null;
        this.init();
    }

    init() {
        // Initialize the confirmation page
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add event listeners for buttons and interactions
        document.addEventListener('DOMContentLoaded', () => {
            this.setupDownloadButton();
            this.setupContactHotelButton();
            this.setupGetDirectionsButton();
            this.setupViewReceiptButton();
        });
    }

    // Main function to render confirmation page when hotel is booked successfully
    renderConfirmationPage(bookingResponse) {
        try {
            console.log('Rendering confirmation page with data:', bookingResponse);
            
            if (!bookingResponse || !bookingResponse.GetBookingDetailResult) {
                throw new Error('Invalid booking response data');
            }

            const bookingDetail = bookingResponse.GetBookingDetailResult;
            
            // Check if booking was successful
            if (bookingDetail.Error.ErrorCode !== 0) {
                throw new Error(`Booking failed: ${bookingDetail.Error.ErrorMessage}`);
            }

            const drillDownData = window.currentHotelData || {};

            this.bookingData = {
                voucherStatus: bookingDetail.VoucherStatus,
                status: bookingDetail.HotelBookingStatus,
                invoiceNumber: bookingDetail.InvoiceNo,
                confirmationNo: bookingDetail.ConfirmationNo,
                bookingRefNo: bookingDetail.BookingRefNo,
                bookingId: bookingDetail.BookingId,
                traceId: bookingDetail.TraceId,
                isPriceChanged: bookingDetail.IsPriceChanged,
                isCancellationPolicyChanged: bookingDetail.IsCancellationPolicyChanged,
                hotelName: bookingDetail.HotelName,
                hotelAddress: bookingDetail.AddressLine1,
                city: bookingDetail.City,
                checkInDate: bookingDetail.CheckInDate,
                checkOutDate: bookingDetail.CheckOutDate,
                netAmount: bookingDetail.NetAmount,
                invoiceAmount: bookingDetail.InvoiceAmount,
                rooms: bookingDetail.Rooms,
                rateConditions: bookingDetail.RateConditions,
                cancellationPolicies: bookingDetail.Rooms?.[0]?.CancelPolicies || [],
                amenities: bookingDetail.Rooms?.[0]?.Amenities || [],
                starRating: bookingDetail.StarRating,
                latitude: bookingDetail.Latitude,
                longitude: bookingDetail.Longitude,
                bookingDate: bookingDetail.BookingDate,
                lastCancellationDate: bookingDetail.LastCancellationDate,
                guestNationality: bookingDetail.GuestNationality,
                isDomestic: bookingDetail.IsDomestic,
                phoneNumber: drillDownData.PhoneNumber || '',
                pinCode: drillDownData.PinCode || ''
            };

            this.updateConfirmationUI();
            this.showConfirmationPage();
            this.updateHotelDetailsFromBookingData();
            
        } catch (error) {
            console.error('Error rendering confirmation page:', error);
            this.showErrorPage(error.message);
        }
    }

    updateConfirmationUI() {
        const d = this.bookingData;

        // Hotel image: prefer currentHotelData images, fallback placeholder
        const hotelImages = (window.currentHotelData && window.currentHotelData.Images) || [];
        const imgEl = document.getElementById('confirmHotelImage');
        if (imgEl) {
            imgEl.src = hotelImages[0] || 'https://plus.unsplash.com/premium_photo-1682913629540-3857602b540c?q=80&w=2080&auto=format&fit=crop';
            imgEl.alt = d.hotelName || 'Hotel';
        }

        // Sub-heading location
        const subHeading = document.getElementById('confirmSubHeading');
        if (subHeading && d.city) {
            subHeading.textContent = `You're going to ${d.city}`;
        }

        // Hotel name
        const nameEl = document.getElementById('confirmHotelName');
        if (nameEl && d.hotelName) {
            nameEl.textContent = d.hotelName;
        }

        // Star rating
        const ratingEl = document.getElementById('confirmStarRating');
        if (ratingEl && d.starRating) {
            ratingEl.innerHTML = '★'.repeat(d.starRating) + '☆'.repeat(5 - d.starRating) + ` ${d.starRating}-Star Hotel`;
        }

        // Host info from hotel name
        const hostNameEl = document.getElementById('confirmHostName');
        if (hostNameEl && d.hotelName) {
            hostNameEl.textContent = d.hotelName;
        }
        const hostInfoEl = document.getElementById('confirmHostInfo');
        if (hostInfoEl && d.starRating) {
            hostInfoEl.textContent = `${d.starRating}-Star Hotel`;
        }

        // Check-in / check-out dates
        if (d.checkInDate && d.checkOutDate) {
            const checkIn = new Date(d.checkInDate);
            const checkOut = new Date(d.checkOutDate);
            const nights = Math.ceil((checkOut - checkIn) / 86400000);

            const ciEl = document.getElementById('confirmCheckIn');
            const coEl = document.getElementById('confirmCheckOut');
            const nightsEl = document.getElementById('confirmNights');
            if (ciEl) ciEl.textContent = this.formatDate(d.checkInDate);
            if (coEl) coEl.textContent = this.formatDate(d.checkOutDate);
            if (nightsEl) nightsEl.textContent = `${nights} Night${nights > 1 ? 's' : ''}`;

            // Trip summary line
            let totalAdults = 0;
            let totalChildren = 0;
            const roomCount = (d.rooms || []).length;
            (d.rooms || []).forEach(room => {
                (room.HotelPassenger || []).forEach(p => {
                    if (p.PaxType === 2) totalChildren++;
                    else totalAdults++;
                });
            });
            const summaryEl = document.getElementById('confirmTripSummary');
            if (summaryEl) {
                let parts = [`${nights} Night${nights > 1 ? 's' : ''}`];
                if (totalAdults) parts.push(`${totalAdults} Adult${totalAdults > 1 ? 's' : ''}`);
                if (totalChildren) parts.push(`${totalChildren} Child${totalChildren > 1 ? 'ren' : ''}`);
                parts.push(`${roomCount} Room${roomCount > 1 ? 's' : ''}`);
                summaryEl.textContent = '| ' + parts.join(' | ');
            }
        }

        // Guest details
        this.renderGuestDetailsSummary(d.rooms);

        // Address
        const addrEl = document.getElementById('confirmAddress');
        if (addrEl) {
            addrEl.innerHTML = d.hotelAddress
                ? `${d.hotelAddress}${d.city ? '<br>' + d.city : ''}`
                : '--';
        }

        // Amount
        const amountEl = document.getElementById('confirmAmount');
        if (amountEl) {
            const amount = d.invoiceAmount || d.netAmount;
            amountEl.textContent = amount ? this.formatCurrency(amount) : '--';
        }

        // Reservation code
        const resCodeEl = document.getElementById('confirmReservationCode');
        if (resCodeEl) resCodeEl.textContent = d.confirmationNo || '--';

        // Booking status
        const statusEl = document.getElementById('confirmBookingStatus');
        if (statusEl && d.status) {
            statusEl.textContent = d.status;
            statusEl.className = `booking-status ${d.status.toLowerCase()}`;
        }

        // Invoice number
        const invEl = document.getElementById('confirmInvoiceNumber');
        if (invEl) invEl.textContent = d.invoiceNumber || '--';

        // Booking reference
        const refEl = document.getElementById('confirmBookingRef');
        if (refEl) refEl.textContent = d.bookingRefNo || '--';
    }

    renderGuestDetailsSummary(rooms) {
        const container = document.getElementById('confirmGuestDetails');
        if (!container || !rooms || rooms.length === 0) return;

        let html = '<h3 class="guest-summary-title">Guest Details</h3>';
        rooms.forEach((room, rIdx) => {
            if (!room.HotelPassenger || room.HotelPassenger.length === 0) return;
            if (rooms.length > 1) {
                html += `<h4 class="guest-room-label">Room ${rIdx + 1}</h4>`;
            }
            room.HotelPassenger.forEach(p => {
                const isLead = p.LeadPassenger;
                const paxLabel = p.PaxType === 2 ? 'Child' : 'Adult';
                html += `
                    <div class="guest-summary-card${isLead ? ' lead-guest' : ''}">
                        <div class="guest-summary-name">
                            ${p.Title || ''} ${p.FirstName || ''} ${p.LastName || ''}
                            ${isLead ? '<span class="lead-badge">Lead Guest</span>' : ''}
                        </div>
                        <div class="guest-summary-meta">
                            <span class="guest-pax-type">${paxLabel}</span>
                            ${p.Email ? `<span><i class="fas fa-envelope"></i> ${p.Email}</span>` : ''}
                            ${p.Phoneno ? `<span><i class="fas fa-phone"></i> ${p.Phoneno}</span>` : ''}
                        </div>
                    </div>
                `;
            });
        });

        container.innerHTML = html;
    }

    showConfirmationPage() {
        // Hide any loading or error states
        this.hideLoadingState();
        this.hideErrorState();
        
        // Hide all other pages
        this.hideAllPages();
        
        // Show the confirmation page
        const confirmationPage = document.getElementById('hotelConfirmationPage');
        const confirmationContainer = document.getElementById('confirmationContainer');
        
        if (confirmationPage) {
            confirmationPage.classList.remove('hidden');
            confirmationPage.style.display = 'block';
        }
        
        if (confirmationContainer) {
            confirmationContainer.style.display = 'block';
        }

        // Add success animation
		this.addSuccessAnimation();
		
		// Render the confirmation page from the top of the page
		if (confirmationPage) {
			confirmationPage.scrollIntoView({ behavior: 'smooth' });
		}
    }

    hideAllPages() {
        // Hide main page
        const mainPage = document.querySelector('.page');
        if (mainPage) {
            mainPage.classList.add('hidden');
        }

        // Hide hotel results page
        const resultsPage = document.getElementById('hotelResultsPage');
        if (resultsPage) {
            resultsPage.classList.add('hidden');
        }

        // Hide drill down page
        const drillContainer = document.getElementById('drillContainer');
        if (drillContainer) {
            drillContainer.classList.add('hidden');
		}
		// Hide review and passenger pages
        const reviewBookingPage = document.getElementById('reviewBookingPage');
        if (reviewBookingPage) {
            reviewBookingPage.classList.add('hidden');
        }
        const passengerDetailsPage = document.getElementById('passengerDetailsPage');
        if (passengerDetailsPage) {
            passengerDetailsPage.classList.add('hidden');
        }
    }

    showErrorPage(errorMessage) {
        // Hide confirmation page
        const confirmationPage = document.getElementById('hotelConfirmationPage');
        if (confirmationPage) {
            confirmationPage.classList.add('hidden');
        }

        // Show error message
        this.showErrorState(errorMessage);
    }

    hideLoadingState() {
        const loadingElement = document.getElementById('confirmationLoadingState');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    hideErrorState() {
        const errorElement = document.querySelector('.error-state');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    showErrorState(message) {
        let errorElement = document.querySelector('.error-state');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-state';
            document.body.appendChild(errorElement);
        }

        errorElement.innerHTML = `
            <div class="error-container">
                <h2>Booking Error</h2>
                <p>${message}</p>
                <button onclick="location.reload()">Try Again</button>
            </div>
        `;
        errorElement.style.display = 'block';
    }

    addSuccessAnimation() {
        const mainHeading = document.querySelector('.main-heading');
        if (mainHeading) {
            mainHeading.classList.add('success-animation');
        }
    }

    setupDownloadButton() {
        const downloadButton = document.querySelector('.download-button');
        if (downloadButton) {
            downloadButton.addEventListener('click', () => {
                this.downloadItinerary();
            });
        }
    }

    setupContactHotelButton() {
        const contactButton = document.querySelector('.contact-hotel');
        if (contactButton) {
            contactButton.addEventListener('click', () => {
                this.contactHotel();
            });
        }
    }

    setupGetDirectionsButton() {
        const directionsButton = document.querySelector('.info-button');
        if (directionsButton && directionsButton.textContent.includes('Get directions')) {
            directionsButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.getDirections();
            });
        }
    }

    setupViewReceiptButton() {
        const receiptButton = document.querySelector('.info-button');
        if (receiptButton && receiptButton.textContent.includes('View receipt')) {
            receiptButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.viewReceipt();
            });
        }
    }

    downloadItinerary() {
        if (!this.bookingData) {
            console.error('No booking data available');
            return;
        }

        // Create itinerary data with new structure
        const itineraryData = {
            confirmationNumber: this.bookingData.confirmationNo,
            bookingReference: this.bookingData.bookingRefNo,
            invoiceNumber: this.bookingData.invoiceNumber,
            status: this.bookingData.status,
            bookingDate: this.formatDate(this.bookingData.bookingDate),
            hotelName: this.bookingData.hotelName,
            hotelAddress: this.bookingData.hotelAddress,
            city: this.bookingData.city,
            checkInDate: this.formatDate(this.bookingData.checkInDate),
            checkOutDate: this.formatDate(this.bookingData.checkOutDate),
            netAmount: this.formatCurrency(this.bookingData.netAmount),
            invoiceAmount: this.formatCurrency(this.bookingData.invoiceAmount),
            starRating: this.bookingData.starRating,
            guestDetails: this.bookingData.rooms?.[0]?.HotelPassenger || [],
            roomDetails: this.bookingData.rooms?.[0] || {},
            cancellationPolicies: this.bookingData.cancellationPolicies,
            amenities: this.bookingData.amenities,
            rateConditions: this.bookingData.rateConditions
        };

        // Generate PDF or download functionality
        this.generateItineraryPDF(itineraryData);
    }

    generateItineraryPDF(itineraryData) {
        // Implementation for PDF generation
        console.log('Generating itinerary PDF:', itineraryData);
        
        // For now, just show a success message
        this.showNotification('Itinerary download started!', 'success');
    }

    contactHotel() {
        if (!this.bookingData) {
            console.error('No booking data available');
            return;
        }

        const phone = this.bookingData.phoneNumber;

        if (phone) {
            const cleaned = phone.replace(/[^\d+]/g, '');
            window.location.href = `tel:${cleaned}`;
        } else {
            this.showContactFallbackModal();
        }
    }

    showContactFallbackModal() {
        const d = this.bookingData;
        const overlay = document.createElement('div');
        overlay.className = 'contact-modal';
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });

        overlay.innerHTML = `
            <div class="contact-modal-content">
                <h3>Contact ${d.hotelName || 'Hotel'}</h3>
                <div class="contact-info">
                    <p>Phone number is not available for this
                        property. Please contact them using
                        the address below.</p>
                    ${d.hotelAddress ? `<p><strong>Address:</strong> ${d.hotelAddress}${d.city ? ', ' + d.city : ''}</p>` : ''}
                    ${d.confirmationNo ? `<p><strong>Confirmation:</strong> ${d.confirmationNo}</p>` : ''}
                </div>
                <div class="contact-actions">
                    <button onclick="this.closest('.contact-modal').remove()">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    }

    getDirections() {
        if (!this.bookingData || !this.bookingData.latitude || !this.bookingData.longitude) {
            this.showNotification('Location coordinates not available', 'error');
            return;
        }

        // Implementation for getting directions using coordinates
        console.log('Getting directions to:', this.bookingData.hotelName);
        
        // Open Google Maps with hotel coordinates
        const mapsUrl = `https://www.google.com/maps?q=${this.bookingData.latitude},${this.bookingData.longitude}`;
        window.open(mapsUrl, '_blank');
        
        this.showNotification('Opening directions in Google Maps...', 'info');
    }

    viewReceipt() {
        if (!this.bookingData) {
            console.error('No booking data available');
            return;
        }

        // Implementation for viewing receipt
        console.log('Viewing receipt for booking:', this.bookingData.bookingId);
        
        // Create receipt data
        const receiptData = {
            invoiceNumber: this.bookingData.invoiceNumber,
            invoiceAmount: this.bookingData.invoiceAmount,
            netAmount: this.bookingData.netAmount,
            bookingDate: this.formatDate(this.bookingData.bookingDate),
            hotelName: this.bookingData.hotelName,
            checkInDate: this.formatDate(this.bookingData.checkInDate),
            checkOutDate: this.formatDate(this.bookingData.checkOutDate),
            guestDetails: this.bookingData.rooms?.[0]?.HotelPassenger || [],
            roomDetails: this.bookingData.rooms?.[0] || {},
            bookingId: this.bookingData.bookingId,
            confirmationNo: this.bookingData.confirmationNo
        };

        // Generate and show receipt
        this.generateReceipt(receiptData);
    }

    generateReceipt(receiptData) {
        // Implementation for receipt generation
        console.log('Generating receipt:', receiptData);
        
        // For now, just show a success message
        this.showNotification('Receipt generated successfully!', 'success');
        
        // You can implement actual receipt generation here
        // This could open a new window with formatted receipt or download PDF
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    // Utility function to format currency
    formatCurrency(amount, currency = '₹') {
        return `${currency} ${parseFloat(amount).toLocaleString('en-IN')}`;
    }

    // Utility function to format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Function to go back to main page
    goBackToMainPage() {
        // Hide confirmation page
        const confirmationPage = document.getElementById('hotelConfirmationPage');
        if (confirmationPage) {
            confirmationPage.classList.add('hidden');
        }

        // Show main page
        const mainPage = document.querySelector('.page');
        if (mainPage) {
            mainPage.classList.remove('hidden');
        }
    }

    updateHotelDetailsFromBookingData() {
        // All UI updates are handled in updateConfirmationUI()
        console.log('Hotel details updated from booking data');
    }
}

// Global instance
let hotelConfirmation;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    hotelConfirmation = new HotelConfirmation();
});

// Function to be called from hotels_helper.js when booking is successful
function handleHotelBookingSuccess(bookingResponse) {
    if (hotelConfirmation) {
        hotelConfirmation.renderConfirmationPage(bookingResponse);
    } else {
        console.error('Hotel confirmation not initialized');
    }
}

// Add CSS styles for the contact modal
function addContactModalStyles() {
    if (!document.getElementById('contact-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'contact-modal-styles';
        style.textContent = `
            .contact-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            
            .contact-modal-content {
                background: white;
                padding: 20px;
                border-radius: 8px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .contact-info {
                margin: 15px 0;
            }
            
            .contact-info p {
                margin: 8px 0;
            }
            
            .contact-actions {
                text-align: center;
                margin-top: 20px;
            }
            
            .contact-actions button {
                padding: 10px 20px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .contact-actions button:hover {
                background: #0056b3;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize styles when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    addContactModalStyles();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HotelConfirmation, handleHotelBookingSuccess };
}
