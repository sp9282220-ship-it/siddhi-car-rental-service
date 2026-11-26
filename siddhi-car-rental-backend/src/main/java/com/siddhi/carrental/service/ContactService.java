package com.siddhi.carrental.service;

import com.siddhi.carrental.dto.MiscDtos.ContactRequest;
import com.siddhi.carrental.entity.ContactMessage;
import com.siddhi.carrental.exception.ApiException;
import com.siddhi.carrental.repository.ContactMessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ContactService {

    private final ContactMessageRepository repository;

    public ContactService(ContactMessageRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public ContactMessage submit(ContactRequest req) {
        ContactMessage m = new ContactMessage();
        m.setName(req.name().trim());
        m.setEmail(req.email().trim().toLowerCase());
        m.setMessage(req.message().trim());
        return repository.save(m);
    }

    public List<ContactMessage> getAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public ContactMessage setRead(Long id, boolean read) {
        ContactMessage m = find(id);
        m.setRead(read);
        return repository.save(m);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(find(id));
    }

    private ContactMessage find(Long id) {
        return repository.findById(id).orElseThrow(() -> ApiException.notFound("Message not found with id " + id));
    }
}
