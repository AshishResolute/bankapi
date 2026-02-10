
create type account_type as enum('savings','current');
create type transaction_type as enum('Debit','Credit');
create type transaction_status as enum('Success','Failed','Pending');



create table if not exists users (
    id serial primary key,
    account_no integer unique not null,
    email varchar(255) unique not null,
    user_name varchar(30) not null,
    phone_no varchar(10) not null,
    created_at timestamp default now()
);


create table if not exists userDetails(
    id serial primary key,
    user_id integer unique references users(id) on delete cascade,
    password_hash varchar(255) not null,
    created_at timestamp default now()
);

create table if not exists user_balance(
    id serial primary key,
    user_id integer unique references users(id) on delete cascade,
    balance numeric default 0.00,
    user_account_type account_type default 'savings',
    created_at timestamp default now()
);

create table if not exists user_transaction_details(
    id serial primary key,
    user_id integer references users(id) on delete cascade,
    transaction_id varchar(255) not null,
    user_transaction_type transaction_type,
    user_transaction_status transaction_status default 'Pending',
    transaction_time timestamp default now()
);