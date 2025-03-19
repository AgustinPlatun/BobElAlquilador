import React from 'react';
import './Card.css';

interface CardProps {
  image: string;
  name: string;
  description: string;
}

const Card: React.FC<CardProps> = ({ image, name, description }) => {
  return (
    <div className="card">
      <img src={image} alt={name} className="card-image" />
      <h3>{name}</h3>
      <p>{description}</p>
      <button className="alquilar-btn">Alquilar</button>
    </div>
  );
};

export default Card;