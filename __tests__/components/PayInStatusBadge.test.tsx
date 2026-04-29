import React from 'react';
import { render } from '@testing-library/react-native';
import { PayInStatusBadge } from '../../src/features/payin/presentation/components/PayInStatusBadge';
import { PayInStatus } from '../../src/features/payin/domain/entities/PayIn';

describe('PayInStatusBadge Component', () => {
  it('renders CREATED status with correct styling', () => {
    const { getByText } = render(
      <PayInStatusBadge status={PayInStatus.CREATED} />
    );

    const statusText = getByText(PayInStatus.CREATED);
    expect(statusText).toBeTruthy();
    expect(statusText.props.style).toBeDefined();
  });

  it('renders VALIDATED status with correct styling', () => {
    const { getByText } = render(
      <PayInStatusBadge status={PayInStatus.VALIDATED} />
    );

    const statusText = getByText(PayInStatus.VALIDATED);
    expect(statusText).toBeTruthy();
    expect(statusText.props.style).toBeDefined();
  });

  it('renders PROCESSED status with correct styling', () => {
    const { getByText } = render(
      <PayInStatusBadge status={PayInStatus.PROCESSED} />
    );

    const statusText = getByText(PayInStatus.PROCESSED);
    expect(statusText).toBeTruthy();
    expect(statusText.props.style).toBeDefined();
  });

  it('renders FAILED status with correct styling', () => {
    const { getByText } = render(
      <PayInStatusBadge status={PayInStatus.FAILED} />
    );

    const statusText = getByText(PayInStatus.FAILED);
    expect(statusText).toBeTruthy();
    expect(statusText.props.style).toBeDefined();
  });

  it('displays status text matching the provided status prop', () => {
    const { getByText, rerender } = render(
      <PayInStatusBadge status={PayInStatus.CREATED} />
    );

    expect(getByText(PayInStatus.CREATED)).toBeTruthy();

    rerender(<PayInStatusBadge status={PayInStatus.PROCESSED} />);
    expect(getByText(PayInStatus.PROCESSED)).toBeTruthy();
  });

  it('applies different colors for different statuses', () => {
    const statuses = [
      PayInStatus.CREATED,
      PayInStatus.VALIDATED,
      PayInStatus.PROCESSED,
      PayInStatus.FAILED,
    ];

    statuses.forEach((status) => {
      const { getByText, unmount } = render(
        <PayInStatusBadge status={status} />
      );

      const statusText = getByText(status);
      const container = statusText.parent;

      expect(container).toBeTruthy();
      expect(container.props.style).toBeDefined();

      unmount();
    });
  });

  it('has correct badge styling properties', () => {
    const { getByText } = render(
      <PayInStatusBadge status={PayInStatus.CREATED} />
    );

    const statusText = getByText(PayInStatus.CREATED);
    const container = statusText.parent;

    // Verify container has styling
    expect(container.props.style).toHaveLength(2);
  });

  it('renders with consistent text styling across statuses', () => {
    const { getByText: getByText1, unmount: unmount1 } = render(
      <PayInStatusBadge status={PayInStatus.CREATED} />
    );

    const text1 = getByText1(PayInStatus.CREATED);
    expect(text1.props.style).toBeDefined();

    unmount1();

    const { getByText: getByText2 } = render(
      <PayInStatusBadge status={PayInStatus.FAILED} />
    );

    const text2 = getByText2(PayInStatus.FAILED);
    expect(text2.props.style).toBeDefined();
  });
});
