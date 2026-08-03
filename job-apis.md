# JOB APIS

Given below are the job apis.
The API base URL for integration is:
WFMS API Base URL :- https://wfmsv2api.htistelecom.in

```json
{
  "openapi": "3.0.1",
  "info": {
    "title": "WFMS_ERP_API",
    "version": "1.0"
  },
  "paths": {
    "/api/Hiring/NoticePeriodDdl": {
      "get": {
        "tags": ["Hiring"],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Hiring/TechnicalSkillAutoFill": {
      "get": {
        "tags": ["Hiring"],
        "parameters": [
          {
            "name": "search",
            "in": "query",
            "schema": {
              "type": "string",
              "default": ""
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Hiring/JobList": {
      "get": {
        "tags": ["Hiring"],
        "parameters": [
          {
            "name": "pageNumber",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 10
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Hiring/JobDetail/{id}": {
      "get": {
        "tags": ["Hiring"],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Hiring/ApplyJob": {
      "post": {
        "tags": ["Hiring"],
        "requestBody": {
          "content": {
            "multipart/form-data": {
              "schema": {
                "required": [
                  "address",
                  "contact",
                  "dob",
                  "email",
                  "gender",
                  "jobId",
                  "name",
                  "resume",
                  "skills"
                ],
                "type": "object",
                "properties": {
                  "jobId": {
                    "type": "integer",
                    "format": "int32"
                  },
                  "name": {
                    "type": "string"
                  },
                  "dob": {
                    "type": "string",
                    "format": "date-time"
                  },
                  "contact": {
                    "pattern": "^[0-9]{10}$",
                    "type": "string"
                  },
                  "email": {
                    "type": "string",
                    "format": "email"
                  },
                  "address": {
                    "type": "string"
                  },
                  "previousCompany": {
                    "type": "string"
                  },
                  "previousDesignation": {
                    "type": "string"
                  },
                  "gender": {
                    "type": "string"
                  },
                  "socialMediaUrl": {
                    "type": "string"
                  },
                  "resume": {
                    "type": "string",
                    "format": "binary"
                  },
                  "totalExperience": {
                    "type": "number",
                    "format": "double"
                  },
                  "currentCTC": {
                    "type": "number",
                    "format": "double"
                  },
                  "expectedCTC": {
                    "type": "number",
                    "format": "double"
                  },
                  "noticePeriodId": {
                    "type": "integer",
                    "format": "int32"
                  },
                  "skills": {
                    "minItems": 1,
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "willingToRelocate": {
                    "type": "string"
                  }
                }
              },
              "encoding": {
                "jobId": {
                  "style": "form"
                },
                "name": {
                  "style": "form"
                },
                "dob": {
                  "style": "form"
                },
                "contact": {
                  "style": "form"
                },
                "email": {
                  "style": "form"
                },
                "address": {
                  "style": "form"
                },
                "previousCompany": {
                  "style": "form"
                },
                "previousDesignation": {
                  "style": "form"
                },
                "gender": {
                  "style": "form"
                },
                "socialMediaUrl": {
                  "style": "form"
                },
                "resume": {
                  "style": "form"
                },
                "totalExperience": {
                  "style": "form"
                },
                "currentCTC": {
                  "style": "form"
                },
                "expectedCTC": {
                  "style": "form"
                },
                "noticePeriodId": {
                  "style": "form"
                },
                "skills": {
                  "style": "form"
                },
                "willingToRelocate": {
                  "style": "form"
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/": {
      "get": {
        "tags": ["WFMS_ERP_API"],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {}
}
```

Note: the live `/api/Hiring/JobDetail/{id}` response currently returns a bare job
object instead of the `{ success, data }` envelope implied by the OpenAPI snippet
above. The frontend has been updated to support the live response shape.

Sample response for /api/Hiring/JobList:

```json
{
  "success": true,
  "data": [
    {
      "jobId": 5,
      "jobCode": "HTIS/26-27/0005",
      "title": ".Net Technical Lead",
      "requiredDateOfJoining": "08-May-2026",
      "vacancies": 1,
      "location": "CHANDIGARH",
      "employmentType": "Full-Time",
      "skills": "Programming & Development",
      "qualification": "B.Tech Computer Science",
      "ageLimit": 25,
      "minExperience": 5,
      "maxExperience": 15,
      "minCtc": "500000",
      "maxCtc": "1600000",
      "gender": "M",
      "description": "Test"
    },
    {
      "jobId": 4,
      "jobCode": "HTIS/26-27/0004",
      "title": "Accountant",
      "requiredDateOfJoining": "07-May-2026",
      "vacancies": 2,
      "location": "CHANDIGARH",
      "employmentType": "Full-Time",
      "skills": "Additional Specialized Skills",
      "qualification": "B.Tech Computer Science",
      "ageLimit": 18,
      "minExperience": 2,
      "maxExperience": 10,
      "minCtc": "300000",
      "maxCtc": "1500000",
      "gender": "M",
      "description": "Test"
    },
    {
      "jobId": 1,
      "jobCode": "HTIS/26-27/0001",
      "title": "Software Developer",
      "requiredDateOfJoining": "09-Sep-2025",
      "vacancies": 25,
      "location": "BILASPUR",
      "employmentType": "Part-Time",
      "skills": "Programming & Development",
      "qualification": "B.Tech Computer Science",
      "ageLimit": 35,
      "minExperience": 2,
      "maxExperience": 5,
      "minCtc": "100000",
      "maxCtc": "1000000",
      "gender": "M",
      "description": "Testing"
    }
  ],
  "totalCount": 3
}
```

Sample response for /api/Hiring/JobDetail/{id}:

Note: during integration, the live endpoint returned a bare job object instead of the
`{ success, data }` envelope shown in the OpenAPI snippet above. The frontend accepts the
live response shape below.

```json
{
  "jobId": 5,
  "jobCode": "HTIS/26-27/0005",
  "title": ".NET TECHNICAL LEAD",
  "requiredDateOfJoining": "08-May-2026",
  "vacancies": 1,
  "location": "CHANDIGARH",
  "employmentType": "Full-Time",
  "skills": "Programming & Development",
  "qualification": "B.Tech Computer Science",
  "ageLimit": 25,
  "minExperience": 5,
  "maxExperience": 15,
  "minCtc": "500000",
  "maxCtc": "1600000",
  "gender": "M",
  "description": "Test"
}
```

Sample response for /api/Hiring/NoticePeriodDdl:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "noticePeriod": "Immediate"
    },
    {
      "id": 2,
      "noticePeriod": "15 Days"
    },
    {
      "id": 3,
      "noticePeriod": "30 Days"
    },
    {
      "id": 4,
      "noticePeriod": "45 Days"
    },
    {
      "id": 5,
      "noticePeriod": "60 Days"
    },
    {
      "id": 6,
      "noticePeriod": "90 Days"
    },
    {
      "id": 7,
      "noticePeriod": "More than 90 Days"
    }
  ]
}
```

Sample response for /api/Hiring/TechnicalSkillAutoFill?search=a:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "technicalSkillName": "Programming & Development"
    },
    {
      "id": 2,
      "technicalSkillName": "Backend Development"
    },
    {
      "id": 3,
      "technicalSkillName": "Database Management"
    },
    {
      "id": 5,
      "technicalSkillName": "Testing & Quality Assurance"
    },
    {
      "id": 6,
      "technicalSkillName": "Additional Specialized Skills"
    },
    {
      "id": 9,
      "technicalSkillName": "java"
    }
  ]
}
```
