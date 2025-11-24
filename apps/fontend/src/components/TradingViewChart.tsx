import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, type IChartApi, type ISeriesApi, type UTCTimestamp } from 'lightweight-charts';
import { useTheme } from './ThemeProvider';

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradingViewChartProps {
  data: CandleData[];
  height?: number;
}

export function TradingViewChart({ data, height = 500 }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current) return;

    const isDark = theme === 'dark';

    // Create chart
    const chart: IChartApi = createChart(chartContainerRef.current!, {
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#1e293b' : '#ffffff' },
        textColor: isDark ? '#94a3b8' : '#64748b',
      },
      grid: {
        vertLines: { color: isDark ? '#334155' : '#e2e8f0' },
        horzLines: { color: isDark ? '#334155' : '#e2e8f0' },
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      rightPriceScale: {
        borderColor: isDark ? '#334155' : '#e2e8f0',
      },
      timeScale: {
        borderColor: isDark ? '#334155' : '#e2e8f0',
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: isDark ? '#475569' : '#94a3b8',
          style: 3,
        },
        horzLine: {
          width: 1,
          color: isDark ? '#475569' : '#94a3b8',
          style: 3,
        },
      },
      
    });

    if (!chart) {
      console.error("Failed to create chart instance.");
      return;
    }
   chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Add volume series
    const volumeSeries = chart.addHistogramSeries!({
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // set as an overlay by setting a blank priceScaleId
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8, // 80% away from the top
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    // Handle resize
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    // Clean up on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, []); // <-- Run only once on mount

  // Effect for updating data
  useEffect(() => {
    if (!chartRef.current || !candlestickSeriesRef.current || !volumeSeriesRef.current) return;

    const candleDataFormatted = data.map(d => ({
      time: (new Date(d.time).getTime() / 1000) as UTCTimestamp,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    const volumeDataFormatted = data.map(d => ({
      time: (new Date(d.time).getTime() / 1000) as UTCTimestamp,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
    }));

    candlestickSeriesRef.current.setData(candleDataFormatted);
    volumeSeriesRef.current.setData(volumeDataFormatted);

    chartRef.current.timeScale().fitContent();
  }, [data]); // <-- Run when data changes

  // Effect for updating theme
  useEffect(() => {
    if (!chartRef.current) return;

    const isDark = theme === 'dark';
    chartRef.current.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#1e293b' : '#ffffff' },
        textColor: isDark ? '#94a3b8' : '#64748b',
      },
      grid: {
        vertLines: { color: isDark ? '#334155' : '#e2e8f0' },
        horzLines: { color: isDark ? '#334155' : '#e2e8f0' },
      },
    });
  }, [theme]); // <-- Run when theme changes

  // Effect for height changes
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.applyOptions({ height });
  }, [height]); // <-- Run when height changes

  return <div ref={chartContainerRef} className="w-full" />;
}
