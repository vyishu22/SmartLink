#!/bin/bash
# SmartLink – Start both backend and frontend in development

echo "🚀 Starting SmartLink development environment..."

# Start backend
cd backend && npm install --silent && npm run dev &
BACKEND_PID=$!

# Start frontend
cd ../frontend && npm install --silent && npm run dev &
FRONTEND_PID=$!

echo "✅ Backend PID: $BACKEND_PID  (http://localhost:5000)"
echo "✅ Frontend PID: $FRONTEND_PID (http://localhost:5173)"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID; echo 'Stopped.'" INT
wait
