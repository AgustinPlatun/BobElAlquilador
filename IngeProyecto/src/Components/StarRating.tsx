import React from 'react';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { BsStar } from 'react-icons/bs';

interface StarRatingProps {
  rating: number;
  size?: number;
  readonly?: boolean;
  onRatingChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  size = 20, 
  readonly = false,
  onRatingChange 
}) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  // Generar estrellas llenas
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <FaStar
        key={`full-${i}`}
        size={size}
        color="#FFD700"
        style={{ cursor: readonly ? 'default' : 'pointer' }}
        onClick={() => !readonly && onRatingChange && onRatingChange(i + 1)}
      />
    );
  }

  // Agregar media estrella si es necesario
  if (hasHalfStar) {
    stars.push(
      <FaStarHalfAlt
        key="half"
        size={size}
        color="#FFD700"
        style={{ cursor: readonly ? 'default' : 'pointer' }}
        onClick={() => !readonly && onRatingChange && onRatingChange(fullStars + 0.5)}
      />
    );
  }

  // Completar con estrellas vacías
  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <BsStar
        key={`empty-${i}`}
        size={size}
        color="#FFD700"
        style={{ cursor: readonly ? 'default' : 'pointer' }}
        onClick={() => !readonly && onRatingChange && onRatingChange(fullStars + i + 1)}
      />
    );
  }

  return (
    <div className="d-flex align-items-center">
      {stars}
      {readonly && (
        <span className="ms-2" style={{ fontSize: size * 0.6 }}>
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

export default StarRating; 