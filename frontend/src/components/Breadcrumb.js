import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Một hàm helper để chuyển đổi tên path thành tên hiển thị (tùy chọn)
const getPathName = (pathSegment) => {
    // Bạn có thể mở rộng logic này để xử lý các trường hợp phức tạp hơn
    // Ví dụ: lấy tên module từ ID, v.v.
    switch (pathSegment) {
        case 'modules':
            return 'Modules';
        // Thêm các trường hợp khác nếu cần
        default:
            // Giữ nguyên nếu là ID hoặc không có mapping cụ thể
            return pathSegment.charAt(0).toUpperCase() + pathSegment.slice(1);
    }
};

const Breadcrumb = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x); // Tách path và loại bỏ phần tử rỗng

    // Nếu đang ở trang chủ thì không hiển thị breadcrumb
    if (pathnames.length === 0) {
        return null;
    }

    return (
        <nav aria-label="breadcrumb" style={{ marginBottom: '20px', padding: '10px', borderBottom: '1px solid #eee' }}>
            <ol style={{ listStyle: 'none', display: 'flex', padding: 0, margin: 0 }}>
                {/* Luôn có link về Trang chủ */}
                <li style={{ marginRight: '8px' }}>
                    <Link to="/">Home</Link>
                </li>
                {pathnames.map((value, index) => {
                    const last = index === pathnames.length - 1;
                    // Tạo đường dẫn tích lũy cho mỗi segment
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const displayName = getPathName(value); // Lấy tên hiển thị

                    return (
                        <li key={to} style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ margin: '0 8px' }}>/</span>
                            {last ? (
                                // Phần tử cuối cùng không phải là link
                                <span aria-current="page">{displayName}</span>
                            ) : (
                                <Link to={to}>{displayName}</Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
