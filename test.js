//Inbuilt modules
const http = require('http');
require('./utils.js')();
require('./validator.js')();

var nodeapp_hostname = process.env.nodeapp_hostname || 'localhost'; // set our host
var nodeapp_port = process.env.nodeapp_port || 7078; // set our port

const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        res.setHeader('Content-Type', 'application/json');
        console.log("Form processing started...\n")

        collectrequestdata(req, result => {
            var collected_data = JSON.parse(JSON.stringify(result))
			if(collected_data != undefined){
            console.log("req body", collected_data)
            fieldvalidator(collected_data, function(err, response) {

                console.log("Field validations started\n")
                if (response['missing_fields'] == undefined) {

                    var filesGenerated = ''
                    var file_count = 0;
                    if (typeof collected_data.documents != 'undefined') {
                        file_count = collected_data.documents.length
                        //console.log("file count",file_count)

                        if (file_count > 0) {
                            console.log("converting attached files to base64 encoded\n")
                            var filelist = collected_data.documents
                            var filesGenerated = []
                            var counter = 0
                            filelist.forEach(function(file) {
                                ++counter
                                var file_data = file.src.changingThisBreaksApplicationSecurity;
                                var file_data_array = file_data.split(',');
                                var file_encoded = file_data_array[1]
                                var file_metadata = file_data_array[0].split('/')
                                var file_extension = file_metadata[1].split(';')[0]
                                console.log("file_extension", file_extension)

                                var fileGenerated = {
                                    "notetext": "File Attached",
                                    "subject": "File Attached",
                                    "filename": 'FileAttached_' + counter + "." + file_extension,
                                    "mimetype": "application/octet-stream",
                                    "documentbody": file_encoded
                                }
                                filesGenerated.push(fileGenerated)
                            })

                        }
                    }

                    //console.log("files generated",filesGenerated)
                    var request = cleanJSON(collected_data) // remove null or empty fields
                    var app_type = collected_data["apptype"]
                    //PDF generator module
                    pdfgeneratewithencodedstring(app_type, request, res, function(err, base64String) {
                        
                        if (!err) {

                            var pdfGenerated = {
                                "notetext": "PDF Generated",
                                "subject": "PDF Generated",
                                "filename": "PDF_Generated.pdf",
                                "mimetype": "application/pdf",
                                "documentbody": base64String
                            }
                            //console.log(base64String)

                            // Mapping UI fields with CRM fields
                            var formData = {}

                            var apptype = request['apptype']

                            if (apptype == "pa") {

                                /*
                                var formData = request
                                delete request['apptype']
                                delete request['documents']
                                */

                                formData['name'] = request['name']
                                formData['address1_line1'] = request['address1_line1']
                                formData['po_feinnumber'] = request['po_feinnumber']
                                formData['address1_city'] = request['address1_city']
                                formData['address1_postalcode'] = request['address1_postalcode']
                                formData['address2_line1'] = request['address2_line1']
                                formData['address2_city'] = request['address2_city']
                                formData['address2_postalcode'] = request['address2_postalcode']
                                formData['emailaddress1'] = request['emailaddress1']
                                formData['telephone1'] = request['telephone1']
                                formData['po_agencyprinciplename'] = request['po_agencyprinciplename']
                                formData['emailaddress2'] = request['emailaddress2']
                                formData['po_Address1StateId@odata.bind'] = request['po_Address1StateId@odata.bind']
                                formData['po_Address2StateId@odata.bind'] = request['po_Address2StateId@odata.bind']
                                formData['po_programtype'] = request['po_programtype']
                                formData['po_CampaignId@odata.bind'] = request['po_CampaignId@odata.bind']
                                formData['po_leadchannel'] = request['po_leadchannel']
                                formData['customertypecode'] = request['customertypecode']
                                formData['po_journeyname'] = request['po_journeyname']
                                formData['po_webcampaignid'] = request['po_webcampaignid']
                                formData['po_leaddomain'] = request['po_leaddomain']
                                formData['po_istest'] = "true"
                                formData['po_environment'] = "live"
                                formData['po_userid'] = "test"

                                if (request['websiteurl'] != undefined) {
                                    formData['websiteurl'] = request['websiteurl']
                                }

                                formData['po_administrativecontact'] = request['AdministrativeFirstName'] + " " + request['AdministrativeLastName']

                                formData['po_agencyresidentstatelicensenumber'] = request['po_agencyresidentstatelicensenumber']

                                if (request['po_agencyincorporated'] != undefined) {
                                    //formData['po_agencyincorporated'] = request['po_agencyincorporated']
                                    if (request['po_agencyincorporated'] == 0) {
                                        formData['po_agencyincorporated'] = false
                                    } else {
                                        formData['po_agencyincorporated'] = true
                                    }
                                }

                                if (request['po_StateofIncorporationId@odata.bind'] != undefined) {
                                    formData['po_StateofIncorporationId@odata.bind'] = request['po_StateofIncorporationId@odata.bind']
                                }
                                if (request['po_1meocoverage'] != undefined) {
                                    //formData['po_1meocoverage'] = request['po_1meocoverage']
                                    if (request['po_1meocoverage'] == 0) {
                                        formData['po_1meocoverage'] = false
                                    } else {
                                        formData['po_1meocoverage'] = true
                                    }
                                }
                                if (request['po_residentnonresidentlicenses'] != undefined) {
                                    //formData['po_residentnonresidentlicenses'] = request['po_residentnonresidentlicenses']
                                    if (request['po_residentnonresidentlicenses'] == 0) {
                                        formData['po_residentnonresidentlicenses'] = false
                                    } else {
                                        formData['po_residentnonresidentlicenses'] = true
                                    }
                                }
                                if (request['po_residentnonresidentlicenses'] != undefined) {
                                    formData['po_pctofhnwpersonallinesofbusinesspremium'] = request['po_residentnonresidentlicenses']['name']
                                }


                            } else {
                                /*
                                var formData = request
                                delete request['apptype']
                                delete request['documents']
                                */

                                formData['firstname'] = request['firstname']
                                formData['lastname'] = request['lastname']
                                formData['address1_line1'] = request['address1_line1']
                                formData['address1_city'] = request['address1_city']
                                formData['address1_postalcode'] = request['address1_postalcode']
                                formData['po_programtype'] = request['po_programtype']
                                formData['po_leadchannel'] = request['po_leadchannel']
                                formData['customertypecode'] = request['customertypecode']
                                formData['po_journeyname'] = request['po_journeyname']
                                formData['po_webcampaignid'] = request['po_webcampaignid']
                                formData['po_leaddomain'] = request['po_leaddomain']
                                formData['po_address1stateid@odata.bind'] = request['po_address1stateid@odata.bind']
                                formData['po_campaignid@odata.bind'] = request['po_campaignid@odata.bind']
                                formData['po_istest'] = "true"
                                formData['po_environment'] = "live"

                            }
                            //console.log("formdata before sending to CRM module",formData)

                            //CRM post module
                            CRM_POST(apptype, formData, pdfGenerated, file_count, filesGenerated, function(err, response) {
                                try {
                                    //console.log("response.statusCode", response.statusCode)
                                    if (err) {

                                        response = {}
                                        response['status'] = err.statusCode
                                        console.log("response statusCode", response['status'])
                                        response['message'] = "post failed"
                                        res.end(JSON.stringify(response))

                                    } else {
                                        if (response.statusCode == 201) {
                                            //console.log("\nForm data submitted\n")
                                            res.statusCode = 200
                                            response = {}
                                            response['status'] = res.statusCode
                                            console.log("response statusCode", response['status'])
                                            response['message'] = "post success"

                                            res.end(JSON.stringify(response))

                                        } else {

                                            response = {}
                                            response['status'] = response.statusCode
                                            console.log("response statusCode", response['status'])
											response['message'] = "post failed"
                                            res.end(JSON.stringify(response))

                                        }
                                    }
                                } catch (e) {
                                    response = {}
                                    response['status'] = 500
                                    console.log("response statusCode", response['status'])
                                    console.log("error: ", e)
                                    response['message'] = e
                                    res.end(JSON.stringify(response))
                                }
                            });

                            //console.log("statusCode",res.statusCode)
                            //res.end("post success")
                        } else {
                            console.log(err)
							response = {}
                            response['status'] = 400
                            console.log("response statusCode", 400)
                            response['message'] = "post failed"
                            res.end(JSON.stringify(response))
                        }
                    });
                } else {
                    try {
                        console.log("required fields missing ", response['missing_fields'])
                        var missing_fields = response['missing_fields']
                        response = {}
                        response['status'] = 400
                        console.log("response statusCode", 400)
                        console.log("Please enter the required fields: ", missing_fields)
                        response['message'] = "Please enter the required fields: " + missing_fields
                        res.end(JSON.stringify(response))
                    } catch (e) {
                        response = {}
                        response['status'] = 500
                        console.log("response statusCode", 500)
                        console.log("Error: ", e)
                        response['message'] = e
                        res.end(JSON.stringify(response))
                    }

                }

            })

        }
		else{
			response = {}
			response['status'] = 400
			res.setHeader('Content-Type', 'application/json');
			response['message'] = "Invalid request"
			console.log("response statusCode", response['status'])
			console.log("response message", response['message'])
			res.end(JSON.stringify(response))
		}
	}
		
		);

    }

    else {
		response = {}
        response['status'] = 400
		res.setHeader('Content-Type', 'application/json');
        response['message'] = "Supports only POST"
		console.log("response statusCode", response['status'])
		console.log("response message", response['message'])
		res.end(JSON.stringify(response))
    }
});

server.listen(process.env.PORT || 3000, function() {
    console.log('Node HTTP server is listening');
});
