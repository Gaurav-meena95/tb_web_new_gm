const PDFDocument = require("pdfkit");
const bwipjs = require("bwip-js");
const fs = require("fs");
const path = require("path");
const mailClass = require("./send-email");
const whatsapp = require("./send-whatsapp");
var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");
const whatsAppSend = require("./send-whatsapp-new");

// initialize firebase app
try {
	if (!admin.apps.length) {
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
			databaseURL:
				"https://tbd-prod-174317-b933e.asia-southeast1.firebasedatabase.app/",
			storageBucket: "gs://travelbuddy-174317.appspot.com", // Replace with your storage bucket

			//databaseURL: "https://tbd-prd-rel-30sep.asia-southeast1.firebasedatabase.app/"
		});
	}
} catch (error) {
	console.log("Firebase app already initialized");
}
const bucket = admin.storage().bucket();

function generateHeader(doc) {
	const lastButOnePath = path.join(__dirname, "..");
	doc
		.image(lastButOnePath + "/view/assets/img/app_logo_new.png", 50, 45, {
			width: 50,
		})
		.fillColor("#444444")
		.fontSize(20)
		.text("Travel Buddy", 110, 57)
		.fontSize(10)
		.text("Terrainspotter Pvt Ltd", 200, 50, { align: "right" })
		.text("Travel Buddy", 200, 65, { align: "right" })
		.text("Gurgaon, Haryana", 200, 80, { align: "right" })
		.moveDown();
}
// Function to create a PDF invoice for flight bookings
async function createFlightInvoice(flightBooking, path) {
	let doc = new PDFDocument({ margin: 50 });

	generateHeader(doc);
	await generateFlightBookingInformation(doc, flightBooking);

	doc.end();
	doc.pipe(fs.createWriteStream(path));
}

function checkAndAddPage(doc, currentPosition) {
	const pageHeight = doc.page.height; // Get the height of the current page

	// Check if the current position exceeds the available height minus margins
	if (currentPosition >= pageHeight - doc.page.margins.bottom - 50) {
		doc.addPage(); // Add a new page
		return doc.page.margins.top; // Reset the position to the top margin of the new page
	}

	return currentPosition; // If no page break, return the current position
}

let bookingInformationTop = 190;
let flightInformationTop = 0;
function generateBarcodePromise(text, barCodeType) {
	return new Promise((resolve, reject) => {
		bwipjs.toBuffer(
			{
				bcid: barCodeType, // 'pdf417', // Barcode type PDF417
				text: text, // Content to encode
				scale: 3, // Scale factor
				height: 10, // Barcode height
				includetext: true, // Include human-readable text below the barcode
			},
			(err, png) => {
				if (err) {
					reject(err);
					console.log("Error creating png");
				} else {
					resolve(png);
					console.log("resolving png");
				}
			}
		);
	});
}

// Function to generate flight booking information
async function generateFlightBookingInformation(doc, flightBooking) {
	doc
		.fillColor("#444444")
		.fontSize(20)
		.text("Flight Booking Details", 150, 160);

	generateHr(doc, 185);

	doc
		.fontSize(10)
		/*.text("Booking ID:", 50, bookingInformationTop)
        .font("Helvetica-Bold")
        .text(
            flightBooking.bookingDetails.bookingId,
            150,
            bookingInformationTop
        )
        .font("Helvetica")*/
		.text("Booking Date:", 50, bookingInformationTop + 15)
		.text(flightBooking.bookingDate, 150, bookingInformationTop + 15)
		.text("Passenger Name:", 50, bookingInformationTop + 30)
		.text(
			flightBooking.outboundFlight.flights[0].passengers[0].firstname,
			150,
			bookingInformationTop + 30
		)
		.text("Email:", 50, bookingInformationTop + 45)
		.text(
			flightBooking.outboundFlight.flights[0].passengers[0].email,
			150,
			bookingInformationTop + 45
		);
	let isGstDetailsPresent = false;
	if (flightBooking.outboundFlight.flights[0].passengers[0].gstNumber) {
		isGstDetailsPresent = true;
		doc
			.fontSize(10)
			.text("GST Number:", 50, bookingInformationTop + 60)
			.text(
				flightBooking.outboundFlight.flights[0].passengers[0].gstNumber,
				150,
				bookingInformationTop + 60
			)
			.text("GST Mobile No:", 50, bookingInformationTop + 75)
			.text(
				flightBooking.outboundFlight.flights[0].passengers[0].gstMobNumber,
				150,
				bookingInformationTop + 75
			);
	}

	let outboundFlightText = flightBooking.inboundFlight
		? "Outbound Flight Details"
		: "Flight Details";

	bookingInformationTop += 10;
	if (isGstDetailsPresent) {
		bookingInformationTop += 30; //AS WE ARE ADDING GST NUMBER AND GST MOBILE NUMBER
	}
	// Flight Details section
	doc
		.fontSize(14)
		.font("Helvetica-Bold")
		.text(outboundFlightText, 50, bookingInformationTop + 60);
	generateHr(doc, 185);

	let barcodeHeight = 0;
	flightInformationTop = bookingInformationTop + 80;
	async function addAllFlightDetails(ibOrObFlight) {
		//flightBooking[ibOrObFlight].flights.forEach((flight) => {
		for (const flight of flightBooking[ibOrObFlight].flights) {
			//One section height
			var oneSecHeight =
				flightInformationTop + 100 + flight.passengers.length * 20 + 60;
			var afterCheckTopPosition = checkAndAddPage(doc, oneSecHeight);
			if (oneSecHeight != afterCheckTopPosition) {
				flightInformationTop = afterCheckTopPosition;
			}

			// Flight Details
			doc.fontSize(10);
			doc
				.roundedRect(50, checkAndAddPage(doc, flightInformationTop), 150, 100)
				.stroke();
			doc
				.roundedRect(200, checkAndAddPage(doc, flightInformationTop), 350, 100)
				.stroke();
			flightInformationTop = checkAndAddPage(doc, flightInformationTop + 20);
			const lastButOnePath = path.join(__dirname, "..");
			try {
				doc.image(
					lastButOnePath +
						"/view/assets/img/AirlineLogo/" +
						flight.airlineCode +
						".gif",
					70,
					flightInformationTop,
					{ width: 18, height: 18 }
				);
			} catch (error) {}
			doc.text(flight.airlineName, 90, flightInformationTop + 4);
			doc.fontSize(8).text(flight.departure, 220, flightInformationTop - 10);
			doc.fontSize(8).text(flight.destination, 400, flightInformationTop - 10);

			flightInformationTop = checkAndAddPage(doc, flightInformationTop + 20);
			doc.text(flight.flightNumber, 70, flightInformationTop);
			doc
				.fontSize(8)
				.text(flight.departureAirportCode, 220, flightInformationTop - 10);
			doc
				.fontSize(8)
				.text(flight.arrivalAirportCode, 400, flightInformationTop - 10);

			flightInformationTop = checkAndAddPage(doc, flightInformationTop + 20);
			doc
				.text("BookingId: ", 70, flightInformationTop)
				.font("Helvetica-Bold")
				.text(
					flightBooking[ibOrObFlight].bookingReference,
					130,
					flightInformationTop
				);
			doc
				.fontSize(8)
				.text(flight.departureTime, 220, flightInformationTop - 10);
			doc.fontSize(8).text(flight.arrivalTime, 400, flightInformationTop - 10);

			flightInformationTop = checkAndAddPage(doc, flightInformationTop + 20);
			doc
				.text("PNR: ", 70, flightInformationTop)
				.font("Helvetica-Bold")
				.text(flightBooking[ibOrObFlight].pnrNumber, 100, flightInformationTop)
				.font("Helvetica");
			doc
				.fontSize(8)
				.text(flight.departureAirportName, 220, flightInformationTop - 10);
			doc
				.fontSize(8)
				.text(flight.arrivalAirportName, 400, flightInformationTop - 10);
			flightInformationTop = checkAndAddPage(doc, flightInformationTop + 10);
			doc.fontSize(8).text(flight.departureTerminal, 220, flightInformationTop);
			doc.fontSize(8).text(flight.arrivalTerminal, 400, flightInformationTop);
			//doc.text('3h 0m', 410, 310);
			//doc.circle(530, 310, 5).fill()32      flightInformationTop += 14042
			//Adding passenger details
			//calculate the height of the rectangle based on the number of passengers and add 20 if barCodeInfo is present for the passenger
			barcodeHeight = 0;
			flight.passengers.forEach((passenger) => {
				barcodeHeight +=
					passenger.barCodeInfo && passenger.barCodeInfo.length > 0 ? 20 : 0;
			});

			doc
				.roundedRect(
					50,
					flightInformationTop + 10,
					500,
					flight.passengers.length * 20 + 60 + barcodeHeight
				)
				.stroke();
			flightInformationTop = checkAndAddPage(doc, flightInformationTop + 20);
			doc
				.fontSize(12)
				.font("Helvetica-Bold")
				.text("Passenger Details", 55, flightInformationTop);
			flightInformationTop = checkAndAddPage(doc, flightInformationTop + 20);
			doc
				.fontSize(11)
				.font("Helvetica-Bold")
				.text("TRAVELLER", 70, flightInformationTop);
			doc.text("SEAT", 320, flightInformationTop);
			doc.text("MEAL", 380, flightInformationTop);
			doc.text("Baggage", 450, flightInformationTop);
			//flight.passengers.forEach((passenger) => {
			for (const passenger of flight.passengers) {
				flightInformationTop = checkAndAddPage(doc, flightInformationTop + 20);
				doc.fontSize(10);
				doc
					.font("Helvetica")
					.text(
						passenger.title +
							". " +
							passenger.firstname +
							" " +
							passenger.lastname,
						70,
						flightInformationTop
					);
				var paxType =
					passenger.paxtype == 1
						? "Adult"
						: passenger.paxtype == 2
						? "Child"
						: "Infant"; //1 for adult, 2 for child, 3 for infant
				doc.text(paxType, 250, flightInformationTop);
				doc.text(passenger.seat, 320, flightInformationTop);
				doc.text(passenger.meal, 380, flightInformationTop);
				doc.text(passenger.Baggage, 450, flightInformationTop);

				if (passenger.barCodeInfo && passenger.barCodeInfo.length > 0) {
					flightInformationTop = checkAndAddPage(
						doc,
						flightInformationTop + 20
					);
					barcodeData = passenger.barCodeInfo[0];
					const barcodeImage = await generateBarcodePromise(
						barcodeData.Content,
						barcodeData.Format.toLowerCase()
					);
					// Add barcode to PDF
					doc.image(barcodeImage, 70, flightInformationTop - 10, {
						width: 100,
						height: 20,
					});
				}

				//                flightInformationTop = checkAndAddPage(doc, flightInformationTop + 60);
			}

			flightInformationTop = checkAndAddPage(doc, flightInformationTop + 20);
		}
	}

	await addAllFlightDetails("outboundFlight");

	if (flightBooking.inboundFlight) {
		flightInformationTop = checkAndAddPage(
			doc,
			flightInformationTop + barcodeHeight - 20
		);
		// Flight Details section
		doc
			.fontSize(14)
			.font("Helvetica-Bold")
			.text("Inbound Flight Details", 50, flightInformationTop);
		flightInformationTop = checkAndAddPage(doc, flightInformationTop + 20);
		await addAllFlightDetails("inboundFlight");
	}

	doc.moveDown();
	doc.fontSize(14);
	var fareSecHeight = flightInformationTop + 120;
	var afterCheckTopPosition = checkAndAddPage(doc, fareSecHeight);
	if (fareSecHeight != afterCheckTopPosition) {
		flightInformationTop = afterCheckTopPosition;
	}

	flightInformationTop = checkAndAddPage(doc, flightInformationTop + 20);
	doc.font("Helvetica-Bold").text("Fare Summary", 200, flightInformationTop);
	doc.fontSize(9);
	flightInformationTop = checkAndAddPage(doc, flightInformationTop + 16);
	doc
		.font("Helvetica-Bold")
		.text(
			"Base Fare: " + flightBooking.charges.basePrice,
			200,
			flightInformationTop,
			{ align: "right" }
		);
	flightInformationTop = checkAndAddPage(doc, flightInformationTop + 16);
	doc
		.font("Helvetica-Bold")
		.text(
			"Tax:    " + parseInt(flightBooking.charges.tax),
			200,
			flightInformationTop,
			{ align: "right" }
		);
	flightInformationTop = checkAndAddPage(doc, flightInformationTop + 16);
	doc
		.font("Helvetica-Bold")
		.text(
			"Convenience charges:    " + flightBooking.charges.additionalCharges,
			200,
			flightInformationTop,
			{ align: "right" }
		);

	var addOnCharges =
		parseInt(flightBooking.charges.totalFare) -
		(parseInt(flightBooking.charges.additionalCharges) +
			parseInt(flightBooking.charges.tax) +
			parseInt(flightBooking.charges.basePrice) -
			parseInt(flightBooking.charges.couponDiscount));
	console.log("addOnCharges", addOnCharges);
	if (addOnCharges > 1) {
		flightInformationTop = checkAndAddPage(doc, flightInformationTop + 16);
		doc
			.font("Helvetica-Bold")
			.text("Add Ons:    " + addOnCharges, 200, flightInformationTop, {
				align: "right",
			});
	}

	flightInformationTop = checkAndAddPage(doc, flightInformationTop + 16);
	doc
		.font("Helvetica-Bold")
		.text(
			"Coupon Discount:    " + flightBooking.charges.couponDiscount,
			200,
			flightInformationTop,
			{ align: "right" }
		);

	flightInformationTop = checkAndAddPage(doc, flightInformationTop + 16);
	doc.fontSize(12);
	doc
		.font("Helvetica-Bold")
		.text(
			"You have paid INR " + flightBooking.charges.totalFare,
			200,
			flightInformationTop,
			{ align: "right" }
		);

	//bookingInformationTop = rowTop + 10;
}

function generateHr(doc, y) {
	doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

/**
 * Uploads a PDF file to Firebase Storage using the Web SDK
 * @param {string} filePath - Local path of the PDF file to upload
 * @param {string} fileName - Name to use for the file in Firebase Storage
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
async function uploadPdfToFirebaseStorage(filePath, fileName) {
	try {
		const destination = `flight-tickets/${fileName}`;
		await bucket.upload(filePath, {
			destination,
			metadata: {
				contentType: "application/pdf",
				cacheControl: "public, max-age=31536000", // Cache for 1 year
			},
		});

		// Get the public URL
		return await main(`flight-tickets/${fileName}`);
		/*const file = bucket.file(destination);
		const [url] = await file.getSignedUrl({
			action: "read",
			expires: "03-01-2500", // Set an expiration date far in the future
		});

		console.log(`PDF uploaded successfully to Firebase Storage: ${url}`);
		return url;*/
	} catch (error) {
		console.error("Error uploading PDF to Firebase Storage:", error);
		throw error;
	}
}

// Send the invoice via email using SendGrid
async function sendInvoice(emailId, bookingDetails) {
	// Define the invoices folder path
	console.log("B4 creating pdf");
	//const invoicesDir = path.join(__dirname, 'invoices');
	const invoicesDir = path.join(__dirname, "../..", "invoices");

	// Check if the invoices directory exists, if not, create it
	if (!fs.existsSync(invoicesDir)) {
		fs.mkdirSync(invoicesDir, { recursive: true });
	}

	// Create the invoice
	/*emailId = 'ranjith@beatravelbuddy.com';
    bookingDetails = {
        "bookingDate": "25-09-2024 11:30",
        "outboundFlight":{
            "bookingReference": "TBD0002343",
            "pnrNumber":  "PNR02342309",
            "flights":[
            {
                "flightNumber": "SPJ0007",
                "airlineCode": "007",
                "airlineName": "SpiceJet",
                "departure": "Bengaluru",
                "destination": "Goa",
                "departureAirportName": "Bengaluru International Airport aaaaad sadfsa",
                "arrivalAirportName": "Goa International Airport",
                "departureAirportCode": "BLR",
                "arrivalAirportCode": "GOI",
                "departureTerminal": "Terminal 1",
                "arrivalTerminal": "Terminal 3",
                "departureTime": "2024-09-23 11:30AM",
                "arrivalTime": "2024-09-23 01:30PM",
                "passengers": [{
                    "firstname": "Ranjith",
                    "lastname": "G",
                    "title": "Mr",
                    "seat": "13b",
                    "meal": "Veg",
                    "paxtype": "1",
                    "baggage": "15kg free"
                }]
            },
            {
                "flightNumber": "UK0008",
                "airlineCode": "",
                "airlineName": "",
                "departure": "Goa",
                "destination": "Delhi",
                "departureAirportName": "",
                "arrivalAirportName": "",
                "departureAirportCode": "",
                "arrivalAirportCode": "",
                "departureTerminal": "",
                "arrivalTerminal": "",
                "departureTime": "2024-09-23 04:30pM",
                "arrivalTime": "2024-09-23 05:30PM",
                "passengers": [{
                    "firstname": "Ranjith",
                    "lastname": "G",
                    "title": "Mr",
                    "seat": "14b",
                    "meal": "Veg",
                    "baggage": "15kg free"
                }]
            }]
        },
        "inboundFlight": {
            "bookingReference": "TBD0001111",
            "pnrNumber":  "PNR02342310",
            "flights":[{
                "flightNumber": "JPS777",
                "airlineCode": "",
                "airlineName": "",
                "departure": "Delhi",
                "destination": "Goa",
                "departureAirportName": "",
                "arrivalAirportName": "",
                "departureAirportCode": "",
                "arrivalAirportCode": "",
                "departureTerminal": "",
                "arrivalTerminal": "",
                "departureTime": "2024-09-27 11:30AM",
                "arrivalTime": "2024-09-27 01:30PM",
                "passengers": [{
                    "firstname": "Ranjith",
                    "lastname": "G",
                    "title": "Mr",
                    "seat": "13b",
                    "meal": "Veg",
                    "baggage": "15kg free"
                }]
            },{
                "flightNumber": "UK777",
                "airlineCode": "",
                "airlineName": "",
                "departure": "Goa",
                "destination": "Bengaluru",
                "departureAirportCode": "",
                "arrivalAirportCode": "",
                "departureAirportName": "",
                "arrivalAirportName": "",
                "departureTerminal": "",
                "arrivalTerminal": "",
                "departureTime": "2024-09-27 07:30pM",
                "arrivalTime": "2024-09-27 09:30PM",
                "passengers": [{
                    "firstname": "Ranjith",
                    "lastname": "G",
                    "title": "Mr",
                    "seat": "15b",
                    "meal": "Veg",
                    "baggage": "15kg free"
                }]
            }]
        },
        "charges":{
            "basePrice": 5200,
            "additionalCharges": 300,
            "couponDiscount": 100,
            "totalFare": 5400
        }
    };*/

	// Define the path for the invoice PDF
	const pdfFileName =
		"flight_ticket_" + bookingDetails.outboundFlight.pnrNumber + ".pdf";
	const invoicePath = path.join(invoicesDir, pdfFileName);

	await createFlightInvoice(bookingDetails, invoicePath);
	//createInvoicePDF(invoicePath);

	//wait for 1 sec to generate send email.
	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Upload the PDF to Firebase Storage
	const pdfUrl = await uploadPdfToFirebaseStorage(invoicePath, pdfFileName);
	console.log("PDF uploaded to Firebase Storage:", pdfUrl);

	// Send the invoice via Whatsapp
	// Call the send_document_template function
	var contactNo =
		bookingDetails.outboundFlight.flights[0].passengers[0].contactNo;
	var countryCode = "+" + contactNo.split("+")[1].split(" ")[0];
	var phoneNo = contactNo.split("+")[1].split(" ")[1];
	var templateName = "flight_ticket_pdf_new";
	var documentUrl = pdfUrl;
	var fileName = pdfFileName;
	var bodyValues = [
		bookingDetails.outboundFlight.flights[0].passengers[0].title,
		bookingDetails.outboundFlight.flights[0].passengers[0].lastname,
		bookingDetails.outboundFlight.pnrNumber,
		bookingDetails.outboundFlight.flights[0].departureTime.split("T")[0],
		bookingDetails.outboundFlight.flights[0].departure,
		bookingDetails.outboundFlight.flights[0].destination,
		bookingDetails.outboundFlight.flights[0].departureTime.split("T")[1],
	];
	console.log("Body values:", bodyValues);
	const response = await whatsAppSend.send_document_template(
		phoneNo,
		countryCode,
		templateName,
		documentUrl,
		fileName,
		bodyValues
	);
	console.log("WhatsApp response:", response);

	let listOfPNRs = bookingDetails.outboundFlight.pnrNumber;
	if (bookingDetails.inboundFlight) {
		listOfPNRs = listOfPNRs + ", " + bookingDetails.inboundFlight.pnrNumber;
	}
	let tplData = {
		full_name: bookingDetails.outboundFlight.flights[0].passengers[0].firstname,
		PNR_NUMBER: listOfPNRs,
		booking_ID: bookingDetails.outboundFlight.bookingReference,
		airline:
			bookingDetails.outboundFlight.flights[0].airlineName +
			" " +
			bookingDetails.outboundFlight.flights[0].airlineCode +
			"-" +
			bookingDetails.outboundFlight.flights[0].flightNumber,
		departure_city: bookingDetails.outboundFlight.flights[0].departure,
		arrival_city:
			bookingDetails.outboundFlight.flights[
				bookingDetails.outboundFlight.flights.length - 1
			].destination,
		departure_time: bookingDetails.outboundFlight.flights[0].departureTime,
		arrival_time:
			bookingDetails.outboundFlight.flights[
				bookingDetails.outboundFlight.flights.length - 1
			].arrivalTime,
	};

	//ADD BCC FOR THE CASE OF USER EMAILID AND EMAILID PROVIDED ARE DIFFERENT.
	var bccEmailId = undefined;
	if (bookingDetails.outboundFlight.flights[0].passengers[0].email) {
		bccEmailId =
			emailId.toLowerCase() ==
			bookingDetails.outboundFlight.flights[0].passengers[0].email.toLowerCase()
				? undefined
				: bookingDetails.outboundFlight.flights[0].passengers[0].email;
	}
	/*Correct the template id for booking confirmation*/
	mailClass.sendEmailWithTemplate(
		emailId,
		tplData,
		"flightBookingConfirmation",
		bccEmailId,
		[
			{
				content: fs.readFileSync(invoicePath).toString("base64"),
				filename: pdfFileName,
				type: "application/pdf",
				disposition: "attachment",
			},
		]
	);

	//uncomment below code
	// Clean up after 15 seconds
	setTimeout(() => {
		fs.unlink(invoicePath, (err) => {
			if (err) {
				console.error("Error deleting the PDF file:", err);
			} else {
				console.log("PDF file deleted successfully.");
			}
		});
	}, 15000); // 15 seconds

	/*if (bookingDetails.inboundFlight){
        listOfPNRs = listOfPNRs + ', ' + bookingDetails.inboundFlight.pnrNumber;
    }

    let templateParams = [
        {  text: bookingDetails.outboundFlight.flights[0].passengers[0].firstname },
        {  text: bookingDetails.outboundFlight.flights[0].airlineName }, 
        {  text: bookingDetails.outboundFlight.bookingReference},  
        {  text: bookingDetails.outboundFlight.flights[0].departureAirportCode } , 
        {  text: bookingDetails.outboundFlight.flights[0].departure},  
        {  text: bookingDetails.outboundFlight.flights[bookingDetails.outboundFlight.flights.length - 1].arrivalAirportCode?bookingDetails.outboundFlight.flights[bookingDetails.outboundFlight.flights.length - 1].arrivalAirportCode: '  ' } , 
        {  text: bookingDetails.outboundFlight.flights[bookingDetails.outboundFlight.flights.length - 1].destination }  ,
        {  text: bookingDetails.outboundFlight.flights[0].departureTime},  
        {  text: listOfPNRs},  
        {  text: bookingDetails.outboundFlight.flights[0].passengers[0].firstname }
    ];
    whatsapp.send_message('+919731781481','flight_confirmation', '', {templateParams: templateParams});*/
}

async function downloadFileFromStorage(fileName, destinationPath = "") {
	try {
		// Create a reference to the file
		console.log(bucket);
		const file = bucket.file(fileName);

		// Check if the file exists
		const [exists] = await file.exists();
		if (!exists) {
			throw new Error(`File ${fileName} does not exist in the storage bucket.`);
		}

		// Determine the destination path
		const destination =
			destinationPath || path.join(process.cwd(), "downloads", fileName);

		// Ensure the directory exists
		const dir = path.dirname(destination);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		console.log(`Downloading file: ${fileName}`);

		// Download the file
		await file.download({ destination });

		console.log(`File downloaded successfully to: ${destination}`);
		return destination;
	} catch (error) {
		console.error("Error downloading file:", error);
		throw error;
	}
}

/**
 * Get file metadata from Firebase Storage
 * @param {string} fileName - The name of the file
 * @returns {Promise<object>} - File metadata
 */
async function getFileMetadata(fileName) {
	try {
		const file = bucket.file(fileName);
		const [metadata] = await file.getMetadata();
		console.log("File metadata:", metadata);
		return metadata;
	} catch (error) {
		console.error("Error getting file metadata:", error);
		throw error;
	}
}

/**
 * Get a signed URL for a file (for temporary access)
 * @param {string} fileName - The name of the file
 * @param {number} [expiresInMinutes=15] - How long the URL should be valid (in minutes)
 * @returns {Promise<string>} - Signed URL
 */
async function getSignedUrl(fileName, expiresInMinutes = 15) {
	try {
		const file = bucket.file(fileName);

		// Generate a signed URL that expires after specified minutes
		const [url] = await file.getSignedUrl({
			action: "read",
			expires: Date.now() + expiresInMinutes * 60 * 1000,
		});

		console.log(`Signed URL (valid for ${expiresInMinutes} minutes):`, url);
		return url;
	} catch (error) {
		console.error("Error generating signed URL:", error);
		throw error;
	}
}

/**
 * Read a file from Firebase Storage into memory
 * @param {string} fileName - The name of the file
 * @returns {Promise<Buffer>} - File contents as a Buffer
 */

// Example usage
async function main(filePath) {
	try {
		// Example file name
		const fileName = filePath;  //"flight-tickets/flight_ticket_P5KEMZ.pdf";

		// // Example 1: Download the file to a local path
		// await downloadFileFromStorage(fileName);

		// // Example 2: Get file metadata
		// await getFileMetadata(fileName);

		// Example 3: Get a signed URL for temporary access
		return await getSignedUrl(fileName, 262800); // Valid for 262800 minutes or 6 months

	} catch (error) {
		console.error("Error in main function:", error);
	}
}

// main('flight-tickets/flight_ticket_OF913H.pdf');
//sendInvoice();


// Hotel Invoice Generation
function hr(doc, y) {
	doc.strokeColor("#ccc").moveTo(50, y).lineTo(550, y).stroke();
  }
  
  function fmt(date) {
	return date ? date.split("T")[0] : "";
  }
  
async function createHotelVoucher(apiResponse, outputPath) {
	const data = apiResponse.GetBookingDetailResult;
	const rooms = data.Rooms || [];

	const totalAdults = rooms.reduce((s, r) => s + (r.AdultCount || 0), 0);
	const totalChildren = rooms.reduce((s, r) => s + (r.ChildCount || 0), 0);

	const doc = new PDFDocument({ margin: 50 });
	doc.pipe(fs.createWriteStream(outputPath));

	// HEADER
	generateHeader(doc);
	doc.fontSize(12).text("Hotel Booking Voucher", 50, 105);

	let top = 130;

	// ===== Booking Info =====
	doc.fontSize(12).text("Booking Details", 50, top);
	hr(doc, top + 15);
	top += 30;

	doc.fontSize(10);
	doc.text("Hotel:", 50, top);
	doc.text(data.HotelName, 150, top);

	doc.text("City:", 50, top + 15);
	doc.text(data.City, 150, top + 15);

	doc.text("Address:", 50, top + 30);
	doc.text(data.AddressLine1, 150, top + 30, { width: 350 });

	top += 60;

	doc.text("Booking Ref:", 50, top);
	doc.text(data.BookingRefNo, 150, top);

	doc.text("Confirmation No:", 50, top + 15);
	doc.text(data.ConfirmationNo, 150, top + 15);

	doc.text("Booking Status:", 50, top + 30);
	doc.text(data.HotelBookingStatus, 150, top + 30);

	top += 55;

	// ===== Guest (all rooms) =====
	doc.fontSize(12).text("Guest Details", 50, top);
	hr(doc, top + 15);
	top += 30;

	doc.fontSize(10);
	for (let i = 0; i < rooms.length; i++) {
		const room = rooms[i];
		const pax = room.HotelPassenger?.find(p => p.LeadPassenger)
			|| room.HotelPassenger?.[0];
		if (pax) {
			const label = rooms.length > 1 ? `Room ${i + 1} - ` : "";
			doc.text(`${label}Guest Name:`, 50, top);
			doc.text(
				`${pax.Title || ""} ${pax.FirstName || ""} ${pax.LastName || ""}`.trim(),
				150,
				top,
			);
			doc.text(`${label}Phone:`, 50, top + 15);
			doc.text(pax.Phoneno || "-", 150, top + 15);
			doc.text(`${label}PAN:`, 50, top + 30);
			doc.text(pax.PAN || "-", 150, top + 30);
			top += 50;
		}
	}
	top += 10;

	// ===== Stay =====
	doc.fontSize(12).text("Stay Details", 50, top);
	hr(doc, top + 15);
	top += 30;

	doc.fontSize(10);
	doc.text("Check In:", 50, top);
	doc.text(fmt(data.CheckInDate), 150, top);

	doc.text("Check Out:", 50, top + 15);
	doc.text(fmt(data.CheckOutDate), 150, top + 15);

	doc.text("Rooms:", 50, top + 30);
	doc.text((data.NoOfRooms ?? rooms.length).toString(), 150, top + 30);

	doc.text("Adults:", 50, top + 45);
	doc.text(totalAdults.toString(), 150, top + 45);

	doc.text("Children:", 50, top + 60);
	doc.text(totalChildren.toString(), 150, top + 60);

	top += 85;

	// ===== Room details (all rooms) =====
	doc.fontSize(12).text("Room Details", 50, top);
	hr(doc, top + 15);
	top += 30;

	doc.fontSize(10);
	for (let i = 0; i < rooms.length; i++) {
		const room = rooms[i];
		const roomLabel = rooms.length > 1 ? `Room ${i + 1} - ` : "";
		doc.text(`${roomLabel}Room Description:`, 50, top);
		doc.text(
			(room.RoomDescription || "")
				.replace(/<[^>]*>/g, ""),
			150,
			top,
			{ width: 350 },
		);
		top += 55;
	}
	top += 25;

	// ===== Cancellation (all rooms) =====
	doc.fontSize(12).text("Cancellation Policy", 50, top);
	hr(doc, top + 15);
	top += 30;

	doc.fontSize(9);
	for (let i = 0; i < rooms.length; i++) {
		const room = rooms[i];
		const policy = room.CancellationPolicy
			? room.CancellationPolicy.replace("|#!#", "").replace(/\|/g, "\n")
			: "";
		if (rooms.length > 1) {
			doc.text(`Room ${i + 1}:`, 50, top);
			top += 15;
		}
		doc.text(policy, 50, top, { width: 500 });
		top += 45;
	}
	top += 25;

	// ===== Fare (all rooms + total) =====
	doc.fontSize(12).text("Fare Summary", 50, top);
	hr(doc, top + 15);
	top += 30;

	doc.fontSize(10);
	let fareY = top;
	for (let i = 0; i < rooms.length; i++) {
		const room = rooms[i];
		const pb = room.PriceBreakUp || {};
		const rate = pb.RoomRate ?? 0;
		const tax = pb.RoomTax ?? 0;
		const roomTotal = rate + tax;
		const label = rooms.length > 1 ? `Room ${i + 1}: ` : "";
		doc.text(`${label}INR ${roomTotal}`, 350, fareY, { align: "right" });
		fareY += 15;
	}

	doc.fontSize(12).font("Helvetica-Bold");
	doc.text(`Total Paid: INR ${data.NetAmount}`, 350, fareY + 10, {
		align: "right",
	});

	doc.end();
}

/**
 * Send Hotel Voucher via Email + WhatsApp
 */
async function sendInvoiceHotels(emailId, apiResponse) {
	// invoices folder
	const invoicesDir = path.join(__dirname, "../..", "invoices");
	if (!fs.existsSync(invoicesDir)) {
		fs.mkdirSync(invoicesDir, { recursive: true });
	}

	const booking = apiResponse.GetBookingDetailResult;
	const rooms = booking.Rooms || [];
	// Primary contact: first lead passenger (for email/WhatsApp template)
	const pax = rooms[0]?.HotelPassenger?.find(p => p.LeadPassenger)
		|| rooms[0]?.HotelPassenger?.[0];

	const pdfFileName = "hotel_voucher_" + booking.BookingRefNo + ".pdf";
	const voucherPath = path.join(invoicesDir, pdfFileName);

	// Create Hotel Voucher PDF
	await createHotelVoucher(apiResponse, voucherPath);

	// wait 1 sec
	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Upload PDF
	const pdfUrl = await uploadPdfToFirebaseStorage(voucherPath, pdfFileName);
	console.log("Hotel voucher uploaded:", pdfUrl);

	// ===== WhatsApp =====
	if (pax?.Phoneno) {
		const contactNo = pax.Phoneno;
		const countryCode = booking.Dialcode || "+91";
		const phoneNo = contactNo;

		const templateName = "hotel_voucher_pdf_bl";
		const guestName = pax
			? `${pax.Title || ""} ${pax.FirstName || ""} ${pax.LastName || ""}`.trim()
			: "N/A";
		const bodyValues = [
		guestName,
		booking.BookingRefNo,
		booking.HotelName,
		booking.City,
		booking.AddressLine1,
		booking.NoOfRooms.toString(),
		fmt(booking.CheckInDate) || "N/A",
		fmt(booking.CheckOutDate) || "N/A",
		fmt(booking.BookingDate) || "N/A",
		fmt(booking.LastCancellationDate) || "N/A"
		].map(v => v || "N/A");

		try {
			await whatsAppSend.send_document_template(
				phoneNo,
				countryCode,
				templateName,
				pdfUrl,
				pdfFileName,
				bodyValues
			);
		} catch (err) {
			console.error("WhatsApp hotel voucher send failed:", err?.response?.data || err.message);
		}
	}

	// ===== Email =====
	const fullName = pax
		? `${pax.Title || ""} ${pax.FirstName || ""} ${pax.LastName || ""}`.trim()
		: "N/A";
	const tplData = {
		full_name: fullName,
		BOOKING_REF: booking.BookingRefNo,
		hotel_name: booking.HotelName,
		city: booking.City,
		address: booking.AddressLine1,
		rooms: booking.NoOfRooms.toString(),
		checkin: fmt(booking.CheckInDate) || "N/A",
		checkout: fmt(booking.CheckOutDate) || "N/A",
		booking_date: fmt(booking.BookingDate) || "N/A",
		cancel_by: fmt(booking.LastCancellationDate) || "N/A"
	};

	try {
		mailClass.sendEmailWithTemplate(
			emailId,
			tplData,
			"hotelBookingConfirmation",
			undefined,
			[
				{
					content: fs.readFileSync(voucherPath).toString("base64"),
					filename: pdfFileName,
					type: "application/pdf",
					disposition: "attachment",
				},
			]
		);
	} catch (err) {
		console.error("Email hotel voucher send failed:", err.message);
	}

	// cleanup
	setTimeout(() => {
		fs.unlink(voucherPath, () => {});
	}, 15000);
}


// ================= HOTEL PDF LOCAL TEST =================

async function testHotelPdf() {
	const demoResponse = {
		GetBookingDetailResult: {
			HotelName: "Atlantis The Palm Dubai",
			City: "Dubai",
			AddressLine1: "Crescent Road The Palm, Palm Jumeirah Dubai",
			BookingRefNo: "878592435098644",
			ConfirmationNo: "7429016275613",
			HotelBookingStatus: "Confirmed",
			CheckInDate: "2024-06-20T00:00:00",
			CheckOutDate: "2024-06-22T00:00:00",
			NoOfRooms: 1,
			NetAmount: 75360.75,

			Rooms: [
				{
					AdultCount: 1,
					ChildCount: 0,
					RoomDescription: "Premium Sea View Room",
					PriceBreakUp: {
						RoomRate: 51970.47,
						RoomTax: 11695.14,
					},
					CancellationPolicy:
						"No cancellation charge till 11-Jun-2024.|100% after that.|#!#",

					HotelPassenger: [
						{
							Title: "Mr.",
							FirstName: "Vaffdhdfgnam",
							LastName: "Singhfhgh",
							LeadPassenger: true,
							Phoneno: "9625251633",
							PAN: "BSKPJ9515C",
						},
					],
				},
			],
			LastCancellationDate: "2024-06-11T23:59:59", 

			LastVoucherDate: "2024-06-11T23:59:59", 

			NoOfRooms: 1, 

			BookingDate: "2024-04-19T12:07:32", 
			Dialcode: "+91",
		},
	};

	const output = path.join(__dirname, "hotel_demo.pdf");

	await createHotelVoucher(demoResponse, output);
	
	await sendInvoiceHotels("pranav@beatravelbuddy.com", demoResponse);

	console.log("✅ Hotel demo PDF created at:", output);
}

// Uncomment to test locally
//testHotelPdf();


module.exports = {
	sendInvoice,
	createHotelVoucher,
	sendInvoiceHotels,
};
