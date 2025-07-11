// src/services/CalendarService.js

const CalendarService = {
  getPlans: async () => {
    const token = localStorage.getItem("userToken");
    const response = await fetch("/plans/get_plans", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    return data;
  },
  
  // 이미 있던 getPlanDetails도 같이 유지!
  getPlanDetails: async (id) => {
    const token = localStorage.getItem("userToken");

    const response = await fetch(`/plans/get_detail_plans?plandetails=${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  },

  deletePlan: async (planId) => {
    const token = localStorage.getItem('userToken');

    const id = Number(planId);

    const response = await fetch(`/plans/delete/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();

    if (!response.ok) {
      // 💥 여기가 핵심! 에러 객체 직접 만들어서 throw!
      throw new Error(text || '삭제 실패!');
    }

    return text ? JSON.parse(text) : { status: 'success' };
  },
};

export default CalendarService;
