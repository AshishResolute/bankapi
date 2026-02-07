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
)