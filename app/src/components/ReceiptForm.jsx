import React from 'react';

const ReceiptForm = ({ data, onChange }) => {

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Handle toggle
        if (type === 'checkbox') {
            onChange({ [name]: checked });
            return;
        }

        onChange({ [name]: value });
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange({ gymLogo: reader.result }); // Save base64
            };
            reader.readAsDataURL(file);
        } else {
            onChange({ gymLogo: null });
        }
    };

    return (
        <div className="card shadow-sm border-0 sticky-top" style={{ top: '80px', zIndex: 1000, maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
            <div className="card-header bg-white border-bottom-0 pt-4 pb-2 px-4">
                <h5 className="card-title fw-bold mb-0">Receipt Details</h5>
                <p className="text-muted small mb-0">Enter details to generate receipt</p>
            </div>
            <div className="card-body px-4 pb-4">
                <form>
                    {/* Gym Info Section */}
                    <h6 className="text-uppercase text-muted fw-bold small mb-3 mt-2">Gym Information</h6>
                    <div className="mb-3">
                        <label className="form-label form-label-sm fw-medium">Gym Name <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" name="gymName" value={data.gymName} onChange={handleInputChange} placeholder="e.g. FitLife Gym" required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label form-label-sm fw-medium">Phone Number</label>
                        <input type="tel" className="form-control" name="gymPhone" value={data.gymPhone} onChange={handleInputChange} placeholder="Contact number" />
                    </div>
                    <div className="mb-4">
                        <label className="form-label form-label-sm fw-medium">Gym Logo (Optional)</label>
                        <input className="form-control form-control-sm" type="file" accept="image/*" onChange={handleLogoUpload} />
                    </div>

                    <hr className="text-black-50" />

                    {/* Member Info Section */}
                    <h6 className="text-uppercase text-muted fw-bold small mb-3 mt-2">Member Information</h6>
                    <div className="mb-3">
                        <label className="form-label form-label-sm fw-medium">Member Name <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" name="memberName" value={data.memberName} onChange={handleInputChange} placeholder="Full name" required />
                    </div>

                    <div className="row mb-3">
                        <div className="col-sm-6">
                            <label className="form-label form-label-sm fw-medium">Plan Duration <span className="text-danger">*</span></label>
                            <select className="form-select" name="planDuration" value={data.planDuration} onChange={handleInputChange} required>
                                <option value="1">1 Month</option>
                                <option value="3">3 Months</option>
                                <option value="6">6 Months</option>
                                <option value="12">1 Year</option>
                            </select>
                        </div>
                        <div className="col-sm-6">
                            <label className="form-label form-label-sm fw-medium">Start Date <span className="text-danger">*</span></label>
                            <input type="date" className="form-control" name="startDate" value={data.startDate} onChange={handleInputChange} required />
                        </div>
                    </div>

                    <div className="mb-4 bg-light rounded p-2 text-center border">
                        <span className="small text-muted d-block mb-1">Calculated End Date</span>
                        <span className="fw-bold text-primary">{data.endDate || '--/--/----'}</span>
                    </div>

                    <hr className="text-black-50" />

                    {/* Payment Section */}
                    <h6 className="text-uppercase text-muted fw-bold small mb-3 mt-2">Payment Details</h6>

                    <div className="row mb-3">
                        <div className="col-sm-6">
                            <label className="form-label form-label-sm fw-medium">Total Amount Paid <span className="text-danger">*</span></label>
                            <div className="input-group">
                                <span className="input-group-text">₹</span>
                                <input type="number" className="form-control" name="amountPaid" value={data.amountPaid} onChange={handleInputChange} placeholder="0.00" min="0" step="1" required />
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <label className="form-label form-label-sm fw-medium">Payment Mode <span className="text-danger">*</span></label>
                            <select className="form-select" name="paymentMode" value={data.paymentMode} onChange={handleInputChange} required>
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="Card">Card</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                            </select>
                        </div>
                    </div>

                    {/* Tax Toggle */}
                    <div className="mb-3 px-3 py-2 border rounded bg-light">
                        <div className="form-check form-switch d-flex align-items-center justify-content-between p-0">
                            <label className="form-check-label fw-medium mb-0" htmlFor="enableGstToggle">Enable GST / Tax</label>
                            <input className="form-check-input ms-0 me-1" type="checkbox" role="switch" id="enableGstToggle" name="enableGst" checked={data.enableGst} onChange={handleInputChange} />
                        </div>

                        {data.enableGst && (
                            <div className="mt-3">
                                <label className="form-label form-label-sm">GST Percentage (%)</label>
                                <div className="input-group input-group-sm">
                                    <input type="number" className="form-control" name="gstPercentage" value={data.gstPercentage} onChange={handleInputChange} min="0" max="100" />
                                    <span className="input-group-text">%</span>
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReceiptForm;
