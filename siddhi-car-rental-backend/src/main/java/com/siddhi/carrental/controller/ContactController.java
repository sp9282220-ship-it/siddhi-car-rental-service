package com.siddhi.carrental.controller;

import com.siddhi.carrental.dto.MiscDtos.ContactRequest;
import com.siddhi.carrental.dto.MiscDtos.MessageResponse;
import com.siddhi.carrental.entity.ContactMessage;
import com.siddhi.carrental.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    // POST /api/contact  (public)
    @PostMapping
    public ResponseEntity<MessageResponse> submit(@Valid @RequestBody ContactRequest req) {
        contactService.submit(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new MessageResponse("Thank you! Your message has been sent."));
    }

    // GET /api/contact  (ADMIN)
    @GetMapping
    public List<ContactMessage> getAll() {
        return contactService.getAll();
    }

    // PUT /api/contact/{id}/read?read=true  (ADMIN)
    @PutMapping("/{id}/read")
    public ContactMessage markRead(@PathVariable Long id, @RequestParam(defaultValue = "true") boolean read) {
        return contactService.setRead(id, read);
    }

    // DELETE /api/contact/{id}  (ADMIN)
    @DeleteMapping("/{id}")
    public MessageResponse delete(@PathVariable Long id) {
        contactService.delete(id);
        return new MessageResponse("Message deleted");
    }
}
