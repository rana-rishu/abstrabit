import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

describe('Frontend Primitive Components Tests', () => {
  it('should render Button with correct text and primary styles', () => {
    render(<Button variant="primary">Submit Document</Button>);
    const btn = screen.getByRole('button', { name: /submit document/i });

    expect(btn).toBeInTheDocument();
    expect(btn.className).toContain('bg-accent-primary');
  });

  it('should render Badge with success status styles', () => {
    render(<Badge variant="success">Completed</Badge>);
    const badge = screen.getByText('Completed');

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-emerald-300');
  });

  it('should render Card container with dark background styling', () => {
    render(<Card>Card Content</Card>);
    const card = screen.getByText('Card Content');

    expect(card).toBeInTheDocument();
    expect(card.className).toContain('bg-bg-card');
  });
});
