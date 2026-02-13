import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options={
    definition:{
          openapi:'3.0.0',
          info:{
            title:'Banking Api Documentation',
            version:'1.0.0',
            description:'A complete banking API with authentication, transactions, and user management',
            contact:{
                name:'API Support',
                email:'support@bankingapi.com'
            }
          },
          servers:[
            {
                url:'http://localhost:3000',
                description:'Development server'
            }
          ],
          components:{
            securitySchemes:{
                bearerAuth: {
                    type:'http',
                    scheme:'bearer',
                    bearerFormat:'JWT',
                    description:'Enter your JWT token'
                }
            },
            schemas:{
                User:{
                    type:'object',
                    properties:{
                        id:{
                            type:'integer',
                            example:1
                        },
                        account_no:{
                            type:'integer',
                            example:12345678
                        },
                        email:{
                            type:'string',
                            format:'email',
                            example:'user@example.com'
                        },
                        user_name:{
                            type:'string',
                            example:'Ash Ketchum'
                        },
                        phone_no:{
                            type:'string',
                            example:'9876543210'
                        },
                        user_account_type:{
                            type:'string',
                            enum:['savings','current']
                        }
                    }
                },
                Transaction:{
                    type:'object',
                    properties:{
                        transaction_id:{
                            type:'string',
                            example:'a1s2d3f4g5h6j7kf'
                        },
                        user_transaction_type:{
                            type:'string',
                            enum:['Credit','Debit'],
                            example:'Credit'
                        },
                        user_transaction_status:{
                            type:'string',
                            enum:['Success','Failed','Pending'],
                            example:'Success'
                        },
                        transaction_time:{
                            type:'string',
                            format:'date-time',
                            example:'2026-02-12T10:30:00Z'
                        }
                    }
                },
                Error:{
                    type:'object',
                    properties:{
                        message:{
                            type:'string',
                            example:'Error message here'
                        }
                    }
                }
            }
          },
          security:[
            {
                bearerAuth:[]
            }
          ]
    },
    apis:['../routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

export {swaggerUi,swaggerSpec};